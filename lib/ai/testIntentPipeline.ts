// Run with: npx tsx lib/ai/testIntentPipeline.ts
//
// Tests the rule-based intent parser directly — no LLM, no server, no UI —
// against the baseline query list. Re-run this same list against an
// LLM-based classifier later and compare the two accuracy numbers.
import { parseIntent } from "./parseIntent";
import { intentTestCases } from "./intentTestCases";

export function runIntentPipelineTest() {
  const results = intentTestCases.map((testCase) => {
    const result = parseIntent(testCase.query);
    const intentCorrect = result.intent === testCase.expectedIntent;
    const targetCorrect = testCase.expectedTarget === undefined || result.target === testCase.expectedTarget;

    return {
      query: testCase.query,
      expected: testCase.expectedIntent,
      expectedTarget: testCase.expectedTarget,
      actual: result.intent,
      target: result.target,
      category: result.category,
      correct: intentCorrect && targetCorrect,
    };
  });

  const passed = results.filter((r) => r.correct).length;

  return { results, passed, total: results.length, accuracy: passed / results.length };
}

const { results, passed, total, accuracy } = runIntentPipelineTest();

for (const r of results) {
  const mark = r.correct ? "✅" : "❌";
  const extra = r.target ? ` (target: ${r.target}${r.category ? `, category: ${r.category}` : ""})` : "";
  const expectedNote = r.correct
    ? ""
    : ` — expected ${r.expected}${r.expectedTarget ? ` (target: ${r.expectedTarget})` : ""}`;
  console.log(`${mark} "${r.query}" → ${r.actual}${extra}${expectedNote}`);
}

console.log(`\nRule-based accuracy: ${passed}/${total} (${(accuracy * 100).toFixed(0)}%)`);
