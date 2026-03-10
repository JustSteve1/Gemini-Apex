// lib/gemini.ts
import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing GOOGLE_GENAI_API_KEY — get one at https://aistudio.google.com/apikey"
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export const GEMINI_MODEL = "gemini-2.5-flash";
