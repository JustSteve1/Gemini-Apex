// lib/bigquery.ts
import { BigQuery } from "@google-cloud/bigquery";

let client: BigQuery | null = null;

export function getBigQueryClient(): BigQuery {
  if (!client) {
    const projectId = process.env.GCP_PROJECT_ID;
    if (!projectId) {
      throw new Error("Missing GCP_PROJECT_ID environment variable");
    }

    // For local dev: set GOOGLE_APPLICATION_CREDENTIALS to your service account key
    // On Cloud Run: uses Application Default Credentials automatically
    const credentials = process.env.GCP_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY)
      : undefined;

    client = new BigQuery({
      projectId,
      ...(credentials ? { credentials } : {}),
    });
  }
  return client;
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  totalRows: number;
  error?: string;
}

export async function executeQuery(sql: string): Promise<QueryResult> {
  try {
    const bq = getBigQueryClient();

    // Safety: only allow read queries
    const trimmed = sql.trim().toUpperCase();
    if (!trimmed.startsWith("SELECT") && !trimmed.startsWith("WITH")) {
      return { rows: [], totalRows: 0, error: "Only SELECT queries are allowed." };
    }

    const [rows] = await bq.query({
      query: sql,
      location: process.env.BQ_LOCATION || "US",
      maximumBytesBilled: "100000000", // 100MB safety cap
    });

    return { rows: rows as Record<string, unknown>[], totalRows: rows.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown BigQuery error";
    console.error("[BigQuery Error]", message);
    return { rows: [], totalRows: 0, error: message };
  }
}
