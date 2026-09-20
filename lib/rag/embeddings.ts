// Server-only. Reads GOOGLE_API_KEY (or GEMINI_API_KEY) via the Google
// GenAI SDK's default credential resolution — never import this into a
// "use client" component directly, or the key would need to ship to the
// browser.
import { GoogleGenAI } from "@google/genai";

// Exported so vectorStore.ts can fold it into the cache key — otherwise
// switching embedding providers/models would silently reuse a disk cache
// built from a different (and dimensionally incompatible) vector space.
// Verified against this project's live API key via models.list() — several
// Gemini SDK doc examples reference "text-embedding-004", but that model
// returns 404 (not found for embedContent) on the current API; the models
// that actually work are gemini-embedding-001 (stable) and
// gemini-embedding-2(-preview).
export const EMBEDDING_MODEL = "gemini-embedding-001";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  client ??= new GoogleGenAI();
  return client;
}

type InputType = "query" | "document";

const TASK_TYPE: Record<InputType, string> = {
  query: "RETRIEVAL_QUERY",
  document: "RETRIEVAL_DOCUMENT",
};

// Gemini embeds queries and documents asymmetrically (taskType) — telling
// it which side of the search a text is on measurably improves retrieval
// quality over embedding both the same way. Defaults match how each
// function is actually called: embedText for the user's question,
// embedTexts for the knowledge-base chunks being indexed.
export async function embedText(text: string, inputType: InputType = "query"): Promise<number[]> {
  const [embedding] = await embedTexts([text], inputType);
  return embedding;
}

// Batched: Gemini's embedContent endpoint accepts an array of inputs in one
// request, which is far cheaper than embedding chunks one call at a time.
export async function embedTexts(texts: string[], inputType: InputType = "document"): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await getClient().models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: { taskType: TASK_TYPE[inputType] },
  });

  return (response.embeddings ?? []).map((item) => item.values ?? []);
}
