// Server-only. Reads GOOGLE_API_KEY (or GEMINI_API_KEY) via the Google
// GenAI SDK's default credential resolution — never import this into a
// "use client" component directly, or the key would need to ship to the
// browser. Call it from a Server Action or a Route Handler instead.
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { CAMPUS_GUIDE_SYSTEM_PROMPT } from "./prompts";
import type { CampusGuideResponse } from "./responseTypes";
import type { ChatMessage } from "./conversationTypes";

const MODEL = "gemini-2.5-flash";

// Structured output, not arbitrary text — Step 6's whole point. Mirrors
// CampusGuideResponse exactly, so the frontend can act on `action` (show a
// building, offer directions, start a quest) instead of just displaying a
// sentence. `target` is optional, not nullable: the model may omit it, but
// it's still just a name it's proposing — resolving it to a real building
// id is handleCampusQuery.ts's job, not this function's.
const CampusGuideResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      source: z.string(),
    })
  ),
  action: z
    .object({
      type: z.enum(["NONE", "SHOW_BUILDING", "GET_DIRECTIONS", "START_QUEST"]),
      target: z.string().optional(),
    })
    .optional(),
  confidence: z.number().optional(),
});

// Gemini's structured-output config takes a JSON Schema (responseJsonSchema),
// not a Zod schema directly — converted once at module load, not per call.
const RESPONSE_JSON_SCHEMA = z.toJSONSchema(CampusGuideResponseSchema);

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  client ??= new GoogleGenAI();
  return client;
}

const FALLBACK_RESPONSE: CampusGuideResponse = {
  answer: "I couldn't generate an answer just now. Please try again in a moment.",
  sources: [],
  action: { type: "NONE" },
};

// Day 11 — Step 11.4. One line of per-request guidance, keyed off the
// retrieval confidence tier (lib/rag/confidenceThreshold.ts), telling the
// model how hard to commit to its answer. Lives here rather than in the
// static CAMPUS_GUIDE_SYSTEM_PROMPT because it depends on this specific
// request's retrieval score, not on the assistant's role in general.
const CONFIDENCE_GUIDANCE: Record<"high" | "medium" | "low", string> = {
  high: "Retrieval confidence is HIGH — answer directly and confidently; a source citation is optional.",
  medium: "Retrieval confidence is MEDIUM — answer, but explicitly name the source you're drawing from in the answer text (e.g. \"According to the Library Guide...\").",
  low: "Retrieval confidence is LOW — the retrieved context only loosely matches this question. Do not present it as a confident answer. Instead, ask a clarifying question to narrow down what the student needs, optionally mentioning the related topic you did find.",
};

// The critical relationship: question + retrieved context + system
// instructions in, one structured CampusGuideResponse out. `context` is
// pre-formatted (see lib/rag/formatContext.ts) — this function doesn't
// know about chunks, embeddings, or the vector store, only the text it was
// handed, keeping it decoupled from the RAG layer the same way every other
// lib/rag module stays decoupled from its neighbors.
//
// `history` (already trimmed by the caller — see conversationTypes.ts) is
// sent as real prior turns, not flattened into the prompt text, so the
// model can resolve a follow-up like "what are its hours?" using genuine
// conversation context. Gemini's roles are "user"/"model", not
// "user"/"assistant", hence the mapping below.
export async function generateCampusAnswer({
  question,
  context,
  history = [],
  confidenceTier,
}: {
  question: string;
  context: string;
  history?: ChatMessage[];
  confidenceTier?: "high" | "medium" | "low";
}): Promise<CampusGuideResponse> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: [
      ...history.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      {
        role: "user",
        parts: [
          {
            text: `Question: ${question}

Retrieved campus context:
${context}

When citing sources, use each source's exact Title and Source file values
from the context above — never a filename you're inferring.
${confidenceTier ? `\n${CONFIDENCE_GUIDANCE[confidenceTier]}` : ""}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: CAMPUS_GUIDE_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: RESPONSE_JSON_SCHEMA,
    },
  });

  if (!response.text) return FALLBACK_RESPONSE;

  try {
    const parsed = CampusGuideResponseSchema.safeParse(JSON.parse(response.text));
    return parsed.success ? parsed.data : FALLBACK_RESPONSE;
  } catch {
    // Invalid JSON from the model — Step 22's "invalid structured output".
    return FALLBACK_RESPONSE;
  }
}
