// Run with: npx tsx lib/ai/testRouteQueryPipeline.ts
//
// Tests the structured-vs-RAG routing decision (Step 16) against the
// worked examples, no server or API key needed since it only exercises
// classifyIntent + routeQuery.
import { classifyIntent } from "./classifyIntent";
import { routeQuery } from "./routeQuery";
import { routeQueryTestCases } from "./routeQueryTestCases";

export function runRouteQueryPipelineTest() {
  const results = routeQueryTestCases.map((testCase) => {
    const intent = classifyIntent(testCase.query);
    const actual = routeQuery(testCase.query, intent);

    return {
      query: testCase.query,
      expected: testCase.expectedRoute,
      actual,
      intent: intent.intent,
      correct: actual === testCase.expectedRoute,
    };
  });

  const passed = results.filter((r) => r.correct).length;

  return { results, passed, total: results.length, accuracy: passed / results.length };
}

const { results, passed, total, accuracy } = runRouteQueryPipelineTest();

for (const r of results) {
  const mark = r.correct ? "✅" : "❌";
  const expectedNote = r.correct ? "" : ` — expected ${r.expected}`;
  console.log(`${mark} "${r.query}" → ${r.actual} (intent: ${r.intent})${expectedNote}`);
}

console.log(`\nRouting accuracy: ${passed}/${total} (${(accuracy * 100).toFixed(0)}%)`);
