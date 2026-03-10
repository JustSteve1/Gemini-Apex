// app/api/agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { executeQuery } from "@/lib/bigquery";
import { SYSTEM_PROMPT, DATASET } from "@/lib/schema";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AgentRequest {
  message: string;
  history?: ChatMessage[];
}

// ── Step 1: Question → SQL (or direct answer) ─────────
async function generateSQL(
  userMessage: string,
  history: ChatMessage[]
): Promise<{ sql: string | null; directAnswer: string | null }> {
  const ai = getGeminiClient();

  const context = history
    .slice(-6)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `Given this conversation:
${context}

User's latest question: "${userMessage}"

If this requires querying the F1 database, respond with ONLY:
{"sql": "SELECT ..."}

If this is a general question (e.g. "what does DRS mean?", "hi"), respond with:
{"answer": "your response"}

Rules:
- Qualify tables: \`${DATASET}.table_name\`
- Always LIMIT (max 50)
- Filter by year + event_name when context is clear
- For "latest"/"recent", use year = 2026
- Return ONLY JSON, no markdown fences`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.1,
    },
  });

  const text = response.text?.trim() || "";

  try {
    const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.sql) return { sql: parsed.sql, directAnswer: null };
    if (parsed.answer) return { sql: null, directAnswer: parsed.answer };
  } catch {
    return { sql: null, directAnswer: text };
  }

  return {
    sql: null,
    directAnswer: "I couldn't parse that. Try asking about lap times, drivers, or corners.",
  };
}

// ── Step 2: Results → conversational answer ────────────
async function interpretResults(
  userMessage: string,
  sql: string,
  rows: Record<string, unknown>[],
  totalRows: number
): Promise<string> {
  const ai = getGeminiClient();
  const displayRows = rows.slice(0, 20);

  const prompt = `The user asked: "${userMessage}"

SQL executed:
\`\`\`sql
${sql}
\`\`\`

Results (${totalRows} rows${totalRows > 20 ? ", first 20 shown" : ""}):
${JSON.stringify(displayRows, null, 2)}

Give a clear, conversational answer:
- Lead with the key insight
- Lap times as mm:ss.sss, speeds in km/h
- Full driver names first mention, then codes
- Highlight deltas in comparisons
- 2-4 sentences for simple queries, more for comparisons
- Never show raw SQL or JSON`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.5,
    },
  });

  return response.text || "Got data but couldn't interpret it. Try rephrasing.";
}

// ── Handler ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: AgentRequest = await req.json();
    const { message, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Step 1
    const { sql, directAnswer } = await generateSQL(message, history);

    if (directAnswer) {
      return NextResponse.json({
        response: directAnswer,
        metadata: { type: "direct" },
      });
    }

    if (!sql) {
      return NextResponse.json({
        response: "Couldn't figure out the query. Try something specific about lap times, drivers, or corners.",
        metadata: { type: "error" },
      });
    }

    // Step 2: Execute
    const result = await executeQuery(sql);

    if (result.error) {
      console.warn("[Agent] Query failed:", result.error);
      return NextResponse.json({
        response: `Query issue: ${result.error}. Try rephrasing, or ask what data is available.`,
        metadata: { type: "error", sql, error: result.error },
      });
    }

    if (result.totalRows === 0) {
      return NextResponse.json({
        response:
          "No data found. The 2026 and 2024 Australian GP are currently loaded — try asking about those.",
        metadata: { type: "empty", sql },
      });
    }

    // Step 3: Interpret
    const answer = await interpretResults(message, sql, result.rows, result.totalRows);

    return NextResponse.json({
      response: answer,
      metadata: { type: "data", sql, rowCount: result.totalRows },
    });
  } catch (err) {
    console.error("[Agent API Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
