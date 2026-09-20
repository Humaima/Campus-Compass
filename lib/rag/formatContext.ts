import type { RetrievedChunk } from "./types";

export function formatContext(chunks: RetrievedChunk[]) {
  return chunks
    .map(
      (chunk, index) => `
SOURCE ${index + 1}
Title: ${chunk.metadata.title}
Category: ${chunk.metadata.category}
Source file: ${chunk.metadata.source}

Content:
${chunk.content}
`
    )
    .join("\n---\n");
}