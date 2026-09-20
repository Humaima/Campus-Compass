// Run with: npx tsx --env-file=.env lib/rag/testRetrievalPipeline.ts [--start=N]
// --start=N skips the first N test cases (0-indexed) — useful for resuming
// after an interruption (e.g. a rate limit) without re-spending budget on
// queries that already passed.
//
// Measures retrieval quality (Step 19/20) and checks the confidence
// threshold (Step 21/22) against a small, manually curated question set.
// Unlike the Day 5 intent tests, this hits the real embeddings API and
// builds the real (disk-cached) vector store, so it needs a working
// GOOGLE_API_KEY (or GEMINI_API_KEY) — --env-file loads
// lib/rag/embeddings.ts's key from .env since this runs outside Next.js,
// which loads .env on its own.
//
// A small delay between requests avoids bursting the free tier's per-minute
// cap; if you still hit a 429, re-run with --start=N to resume.
import { retrieve } from "./retriever";
import { CONFIDENCE_THRESHOLD } from "./confidenceThreshold";
import { retrievalTestCases } from "./retrievalTestCases";

const REQUEST_DELAY_MS = 1_000;

type Row = {
  category: string;
  query: string;
  expected: string;
  retrieved: string;
  score: string;
  correct: boolean;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseStartIndex(): number {
  const arg = process.argv.find((a) => a.startsWith("--start="));
  return arg ? Number(arg.slice("--start=".length)) : 0;
}

async function main() {
  const startIndex = parseStartIndex();
  const rows: Row[] = [];

  const testCases = retrievalTestCases.slice(startIndex);
  if (startIndex > 0) console.log(`Resuming from test case ${startIndex} (skipping the first ${startIndex}).`);

  for (const [offset, testCase] of testCases.entries()) {
    const index = startIndex + offset;
    if (offset > 0) await sleep(REQUEST_DELAY_MS);

    const [top] = await retrieve(testCase.query, 1);
    const retrievedSource = top?.metadata.source ?? "(none)";
    const score = top?.score ?? 0;

    const correct = testCase.expectNoResult
      ? score < CONFIDENCE_THRESHOLD
      : retrievedSource === testCase.expectedSource && score >= CONFIDENCE_THRESHOLD;

    const row: Row = {
      category: testCase.category,
      query: testCase.query,
      expected: testCase.expectNoResult ? "(none)" : (testCase.expectedSource ?? "(none)"),
      retrieved: retrievedSource,
      score: score.toFixed(2),
      correct,
    };
    rows.push(row);
    console.log(
      `[${index + 1}/${retrievalTestCases.length}] ${row.correct ? "✅" : "❌"} "${row.query}" → ${row.retrieved} (${row.score})`
    );
  }

  console.log("\n=== Summary ===");
  const passed = rows.filter((r) => r.correct).length;
  console.log(`\nRetrieval accuracy: ${passed}/${rows.length} (${((passed / rows.length) * 100).toFixed(0)}%)`);
  console.log(`Confidence threshold: ${CONFIDENCE_THRESHOLD}`);

  const onTopicScores = rows.filter((r) => r.expected !== "(none)").map((r) => Number(r.score));
  const noResultScores = rows.filter((r) => r.expected === "(none)").map((r) => Number(r.score));
  if (onTopicScores.length && noResultScores.length) {
    console.log(
      `On-topic scores: min ${Math.min(...onTopicScores).toFixed(2)}, max ${Math.max(...onTopicScores).toFixed(2)}`
    );
    console.log(
      `Out-of-scope scores: min ${Math.min(...noResultScores).toFixed(2)}, max ${Math.max(...noResultScores).toFixed(2)}`
    );
    console.log("Pick CONFIDENCE_THRESHOLD somewhere in the gap between those two ranges.");
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\nRetrieval eval failed before finishing: ${message}`);
  process.exit(1);
});
