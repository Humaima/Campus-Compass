export interface KnowledgeDocument {
  id: string;
  content: string;

  metadata: {
    source: string;
    title: string;
    category: string;
  };
}

export interface RetrievedChunk {
  content: string;

  metadata: {
    source: string;
    title: string;
    category: string;
  };

  score?: number;
}
