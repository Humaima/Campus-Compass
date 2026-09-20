import { CONFIDENCE_THRESHOLD } from "@/lib/rag/confidenceThreshold";
import type { RetrievedChunk } from "@/lib/rag/types";

type Props = { query: string; found: boolean; chunks: RetrievedChunk[] };

// Temporary developer aid for Day 6 — shows exactly what the retriever
// pulled back and how it scored each chunk, so you don't have to guess why
// an answer came out wrong (or why the confidence threshold suppressed it).
// Gated on NODE_ENV so it's dead code (stripped entirely) in a production
// build; no separate step to remember to delete it.
export default function RagDebugPanel({ query, found, chunks }: Props) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="mx-6 mb-6 border-2 border-lime-400 bg-black font-mono text-xs text-lime-400">
      <div className="border-b-2 border-lime-400 px-3 py-2 font-bold">🔍 RAG DEBUG</div>
      <div className="px-3 py-2 border-b border-lime-400/40">
        <div className="opacity-70">Query:</div>
        <div>&quot;{query}&quot;</div>
      </div>
      <div className="px-3 py-2 border-b border-lime-400/40">
        {found ? "✅ found" : "❌ not found"} (threshold: {CONFIDENCE_THRESHOLD})
      </div>
      <div className="px-3 py-2">
        <div className="opacity-70 mb-1">Retrieved:</div>
        {chunks.length === 0 && <div className="opacity-50">(no chunks retrieved)</div>}
        {chunks.map((chunk, index) => (
          <div key={`${chunk.metadata.source}-${index}`} className="mb-1.5">
            <div>
              {index + 1}. {chunk.metadata.title}{" "}
              <span className="opacity-50">[{chunk.metadata.category}]</span>
            </div>
            <div className="pl-3 opacity-80">Score: {chunk.score?.toFixed(2) ?? "n/a"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
