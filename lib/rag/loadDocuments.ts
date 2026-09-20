import { readdir, readFile } from "fs/promises";
import path from "path";
import type { KnowledgeDocument } from "./types";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");

function parseFrontmatter(raw: string): {
  metadata: Record<string, string>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return { metadata: {}, content: raw.trim() };
  }

  const [, frontmatter, body] = match;
  const metadata: Record<string, string> = {};

  for (const line of frontmatter.split(/\r?\n/)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    metadata[key] = value;
  }

  return { metadata, content: body.trim() };
}

export async function loadDocuments(): Promise<KnowledgeDocument[]> {
  const filenames = await readdir(KNOWLEDGE_DIR);
  const markdownFiles = filenames.filter((filename) => filename.endsWith(".md"));

  const documents = await Promise.all(
    markdownFiles.map(async (filename) => {
      const filePath = path.join(KNOWLEDGE_DIR, filename);
      const raw = await readFile(filePath, "utf-8");
      const { metadata, content } = parseFrontmatter(raw);

      const document: KnowledgeDocument = {
        id: path.basename(filename, ".md"),
        content,
        metadata: {
          source: metadata.source ?? filename,
          title: metadata.title ?? filename,
          category: metadata.category ?? "uncategorized",
        },
      };

      return document;
    })
  );

  return documents;
}
