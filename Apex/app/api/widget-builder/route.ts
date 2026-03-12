// app/api/widget-builder/route.ts
// Receives an assembled block sentence + metadata, calls Gemini with the
// widgets skill context, and returns a ready-to-use WidgetConfig JSON.

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";

function getWidgetsSkill(): string {
  try {
    const skillPath = path.join(process.cwd(), ".agent", "skills", "widgets", "SKILL.md");
    if (fs.existsSync(skillPath)) return fs.readFileSync(skillPath, "utf-8");
  } catch {}
  return "";
}

interface BuilderRequest {
  sentence: string;
  blockId: string;
  suggestedType: string;
  suggestedSize: string;
  slotValues: Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    const body: BuilderRequest = await req.json();
    const { sentence, blockId, suggestedType, suggestedSize, slotValues } = body;

    if (!sentence?.trim()) {
      return NextResponse.json({ error: "Sentence is required" }, { status: 400 });
    }

    const ai = getGeminiClient();
    const widgetsSkill = getWidgetsSkill();

    const prompt = `You are an F1 dashboard widget configuration generator.

The user has built a widget request using a block-based builder:

REQUEST: "${sentence}"

Block used: ${blockId}
Suggested widget type: ${suggestedType}
Suggested size: ${suggestedSize}
Slot values: ${JSON.stringify(slotValues, null, 2)}

Using the widget skill reference below, generate a complete, valid WidgetConfig JSON for this request.
The config must follow all rules in the skill — correct table, correct columns, correct filters.

WIDGET SKILL REFERENCE:
${widgetsSkill}

Respond with ONLY a valid JSON object — no markdown, no explanation — matching this exact structure:
{
  "type": "string — widget type key from the registry",
  "size": "1x1 | 2x1 | 1x2 | 2x2",
  "title": "short display title (≤ 20 chars)",
  "params": {},
  "dataSource": {
    "table": "f1_data_library_DS.table_name",
    "columns": ["col1", "col2"],
    "filters": { "season": 2026, "event_name": "Australian Grand Prix" }
  }
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { temperature: 0.1 },
    });

    const text = (response.text ?? "").trim().replace(/```[a-zA-Z]*\n?|```/g, "").trim();

    let config: Record<string, unknown>;
    try {
      config = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Gemini returned invalid JSON. Try rephrasing your request." },
        { status: 422 }
      );
    }

    // Attach a unique id
    config.id = `w-${Date.now()}`;

    return NextResponse.json({ config });
  } catch (err) {
    console.error("[Widget Builder API]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
