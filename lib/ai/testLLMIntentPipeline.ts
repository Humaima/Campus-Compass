// Run with: npx tsx lib/ai/testLLMIntentPipeline.ts
// Requires ANTHROPIC_API_KEY (or an `ant auth login` profile) — this makes
// real, billed API calls, unlike testIntentPipeline.ts.
//
// Same query list as the rule-based test, run through the LLM classifier
// instead — this is the actual "rule-based vs LLM" comparison the earlier
// steps set up.
//
// Only `intent` is graded here, not `target` — the LLM classifier
// deliberately never returns one (see llmIntent.ts). A fair LLM-vs-rules
// accuracy comparison is on intent classification alone.
import { classifyIntentWithLLM } from "./llmIntent";
import { intentTestCases } from "./intentTestCases";

async function main() {
  const results = [];

  for (const testCase of intentTestCases) {
    const result = await classifyIntentWithLLM(testCase.query);
    results.push({
      query: testCase.query,
      expected: testCase.expectedIntent,
      actual: result.intent,
      category: result.category,
      correct: result.intent === testCase.expectedIntent,
    });
  }

  const passed = results.filter((r) => r.correct).length;

  for (const r of results) {
    const mark = r.correct ? "✅" : "❌";
    const extra = r.category ? ` (category: ${r.category})` : "";
    const expectedNote = r.correct ? "" : ` — expected ${r.expected}`;
    console.log(`${mark} "${r.query}" → ${r.actual}${extra}${expectedNote}`);
  }

  console.log(`\nLLM accuracy: ${passed}/${results.length} (${((passed / results.length) * 100).toFixed(0)}%)`);
}

main().catch((error) => {
  console.error("LLM intent test failed to run:", error.message ?? error);
  console.error("Set ANTHROPIC_API_KEY, or run `ant auth login`, then retry.");
  process.exit(1);
});
