// Server-only. Reads ANTHROPIC_API_KEY (or an `ant auth login` profile) via
// the Anthropic SDK's default credential resolution — never import this
// into a "use client" component directly, or the key would need to ship to
// the browser. Call it from a Server Action or a Route Handler instead.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { IntentType, CampusIntent } from "./intentTypes";

const INTENT_VALUES = [
  "SEARCH_BUILDING",
  "SEARCH_SERVICE",
  "GET_DIRECTIONS",
  "ASK_INFORMATION",
  "FIND_CATEGORY",
  "START_QUEST",
  "UNKNOWN",
] as const satisfies readonly IntentType[];

// Deliberately narrow: intent + a coarse category, no `target`. The model
// has no way to know our building ids, and guessing one would undermine the
// whole point of this step — the LLM classifies, it doesn't resolve. Feed
// `category` into the existing keyword/synonym matcher (parseIntent.ts) to
// get an actual building.
const LLMIntentSchema = z.object({
  intent: z.enum(INTENT_VALUES),
  query: z.string(),
  category: z.string().optional(),
});

const SYSTEM_PROMPT = `You are the intent classifier for Arcadia University Campus Compass.

Classify the student's request into exactly one of:
SEARCH_BUILDING
SEARCH_SERVICE
GET_DIRECTIONS
ASK_INFORMATION
FIND_CATEGORY
START_QUEST
UNKNOWN

Return structured JSON only. Do not answer the student's question, look up
a building, or give directions — only translate the request into a
structured classification an app can act on next.`;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

// The LLM counterpart to lib/ai/parseIntent.ts's rule-based classifier —
// same input, same CampusIntent shape out, so lib/ai/testLLMIntentPipeline.ts
// can run both through data/ai/intentTestCases.ts and compare accuracy.
export async function classifyIntentWithLLM(query: string): Promise<CampusIntent> {
  const response = await getClient().messages.parse({
    model: "claude-opus-5",
    max_tokens: 256,
    output_config: {
      format: zodOutputFormat(LLMIntentSchema),
      effort: "low", // classification is simple; no need for deep thinking
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: query }],
  });

  return response.parsed_output ?? { intent: "UNKNOWN", query };
}
