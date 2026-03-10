import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { executeQuery } from "@/lib/bigquery";
import { SYSTEM_PROMPT, DATASET } from "@/lib/schema";

// Helper to load the question2query Agent Skill
function getQuestion2QuerySkill(): string {
  try {
    const skillPath = path.join(process.cwd(), ".agent", "skills", "question2query", "SKILL.md");
    if (fs.existsSync(skillPath)) {
      return fs.readFileSync(skillPath, "utf-8");
    }
  } catch (err) {
    console.warn("[Agent] Failed to load question2query skill:", err);
  }
  return "";
}

// Helper to load the query2schema Agent Skill
function getQuery2SchemaSkill(): string {
  try {
    const skillPath = path.join(process.cwd(), ".agent", "skills", "query2schema", "SKILL.md");
    if (fs.existsSync(skillPath)) {
      return fs.readFileSync(skillPath, "utf-8");
    }
  } catch (err) {
    console.warn("[Agent] Failed to load query2schema skill:", err);
  }
  return "";
}

// Helper to load the answerlogic Agent Skill
function getAnswerlogicSkill(): string {
  try {
    const skillPath = path.join(process.cwd(), ".agent", "skills", "answerlogic", "SKILL.md");
    if (fs.existsSync(skillPath)) {
      return fs.readFileSync(skillPath, "utf-8");
    }
  } catch (err) {
    console.warn("[Agent] Failed to load answerlogic skill:", err);
  }
  return "";
}

// Helper to run the query2schema fetch script and get the live tables
function getLiveSchema(): string {
  try {
    const output = execSync("node .agent/skills/query2schema/scripts/fetch.js", { encoding: "utf-8" });
    const parsed = JSON.parse(output);
    if (parsed.status === 200 && parsed.schema) {
      return JSON.stringify(parsed.schema, null, 2);
    }
  } catch (err) {
    console.warn("Schema fetch failed, falling back to empty:", err);
  }
  return "{}";
}

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
): Promise<{ sql: string | null; directAnswer: string | null; entities: string[] }> {
  const ai = getGeminiClient();
  const skillInstructions = [
    getQuestion2QuerySkill(),
    getQuery2SchemaSkill(),
    getAnswerlogicSkill()
  ].filter(Boolean).join("\n\n---\n\n");
  const liveSchema = getLiveSchema();

  const context = history
    .slice(-6)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `Given this conversation:
${context}

User's latest question: "${userMessage}"

First, you MUST execute the 'question2query' skill to parse the user's question into a Conceptual Graph JSON object, exactly as specified in your instructions.

Only AFTER completing the skill execution (and logging formatting), if the question requires querying the F1 database, include the final SQL string in the same JSON object.

Wait, before you write any SQL, you MUST use the provided live schema dictionary below to know which tables and fields actually exist! Do not invent table names.

## Live BigQuery Schema Dictionary
${liveSchema}

Respond with ONLY this JSON structure:
{
  "skill_execution": {
    "question": "...",
    "metadata": { ... }
  },
  "sql": "SELECT ..."
}

If this is a general question (e.g. "what does DRS mean?", "hi"), respond with:
{
  "answer": "your response"
}

Rules:
- Qualify tables: \`${DATASET}.table_name\`
- Always LIMIT (max 50)
- Filter by year + event_name when context is clear
- For "latest"/"recent", use year = 2026
- Return ONLY JSON, no markdown fences`;

  const fullSystemInstruction = skillInstructions
    ? `${SYSTEM_PROMPT}\n\nAGENTS SKILLS AVAILABLE:\n${skillInstructions}`
    : SYSTEM_PROMPT;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: fullSystemInstruction,
      temperature: 0.1,
    },
  });

  const text = response.text?.trim() || "";
  let extractedEntities: string[] = [];

  try {
    const cleaned = text.replace(/```[a-zA-Z]*\n?|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Save the skill execution to logs
    if (parsed.skill_execution) {
      if (parsed.skill_execution.metadata && parsed.skill_execution.metadata.entities_extracted) {
        extractedEntities = parsed.skill_execution.metadata.entities_extracted;
      }
      try {
        const logsDir = path.join(process.cwd(), "lib", "logs");
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `${timestamp}-question2query.json`;
        fs.writeFileSync(path.join(logsDir, filename), JSON.stringify(parsed, null, 2));
      } catch (logErr) {
        console.warn("[Agent] Failed to write skill execution log:", logErr);
      }
    }

    if (parsed.sql) return { sql: parsed.sql, directAnswer: null, entities: extractedEntities };
    if (parsed.answer) return { sql: null, directAnswer: parsed.answer, entities: [] };
  } catch {
    return { sql: null, directAnswer: text, entities: [] };
  }

  return {
    sql: null,
    directAnswer: "I couldn't parse that. Try asking about lap times, drivers, or corners.",
    entities: []
  };
}

// ── Step 2: Results → conversational answer ────────────
async function interpretResults(
  userMessage: string,
  sql: string,
  rows: Record<string, unknown>[],
  totalRows: number,
  entities: string[]
): Promise<string> {
  const ai = getGeminiClient();
  const displayRows = rows.slice(0, 20);

  const prompt = `The user asked: "${userMessage}"

Extracted Graph Entities from Question:
${JSON.stringify(entities, null, 2)}

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
    const { sql, directAnswer, entities } = await generateSQL(message, history);

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
    const answer = await interpretResults(message, sql, result.rows, result.totalRows, entities);

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
