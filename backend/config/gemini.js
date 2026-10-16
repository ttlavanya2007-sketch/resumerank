import { GoogleGenAI } from "@google/genai";
import { AppError } from "../utils.js";

export const geminiModel = process.env.GEMINI_MODEL || "gemini-flash-latest";

export function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError(503, "Gemini is not configured. Add GEMINI_API_KEY to backend/.env.");
  }

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
