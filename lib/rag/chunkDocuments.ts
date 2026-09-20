import type { KnowledgeDocument, RetrievedChunk } from "./types";

const CHUNK_SIZE = 650;
const CHUNK_OVERLAP = 75;

// No tokenizer dependency yet, so words stand in as a rough proxy for tokens.
// Positions (not just the words themselves) are kept so a chunk can be cut
// straight out of the original string — slicing preserves the source's
// newlines, so markdown structure (headings, tables, lists) survives
// chunking instead of collapsing into one run-on line when words are later
// rejoined with `join(" ")`.
function findWords(text: string): RegExpMatchArray[] {
  return [...text.matchAll(/\S+/g)];
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const words = findWords(text);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  const step = chunkSize - overlap;

  for (let start = 0; start < words.length; start += step) {
    const end = Math.min(start + chunkSize, words.length) - 1;
    const startChar = words[start].index!;
    const lastWord = words[end];
    const endChar = lastWord.index! + lastWord[0].length;
    chunks.push(text.slice(startChar, endChar));

    if (start + chunkSize >= words.length) break;
  }

  return chunks;
}

export function chunkDocuments(
  documents: KnowledgeDocument[],
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): RetrievedChunk[] {
  return documents.flatMap((document) =>
    chunkText(document.content, chunkSize, overlap).map(
      (content): RetrievedChunk => ({
        content,
        metadata: document.metadata,
      })
    )
  );
}
