export type RetrievalTestCase = {
  category: string;
  query: string;
  // The knowledge/*.md `source` filename the top chunk should come from.
  // Omitted (with expectNoResult: true) for questions the knowledge base
  // genuinely has no answer to — Step 21/22's "no good result" case.
  expectedSource?: string;
  expectNoResult?: boolean;
};

// A small, manually curated eval set (Step 19/20) — grounded in what's
// actually written in knowledge/*.md, not guessed. Run against the real
// retriever with lib/rag/testRetrievalPipeline.ts.
export const retrievalTestCases: RetrievalTestCase[] = [
  // Library
  { category: "Library", query: "What time does the library open?", expectedSource: "library-guide.md" },
  { category: "Library", query: "Does the library have printing?", expectedSource: "library-guide.md" },
  { category: "Library", query: "Are study rooms available?", expectedSource: "library-guide.md" },
  { category: "Library", query: "How much does it cost to print in color?", expectedSource: "library-guide.md" },

  // Registration
  { category: "Registration", query: "How do I register for classes?", expectedSource: "registration-guide.md" },
  { category: "Registration", query: "What are the registration deadlines?", expectedSource: "registration-guide.md" },
  { category: "Registration", query: "What happens if I miss the add/drop deadline?", expectedSource: "registration-guide.md" },
  { category: "Registration", query: "What is the minimum full-time credit load?", expectedSource: "registration-guide.md" },

  // Student Services
  { category: "Student Services", query: "How can I get my student ID replaced?", expectedSource: "campus-services.md" },
  { category: "Student Services", query: "Where do I go for financial aid help?", expectedSource: "campus-services.md" },
  { category: "Student Services", query: "Who do I contact for IT support?", expectedSource: "campus-services.md" },

  // Orientation
  { category: "Orientation", query: "What happens during orientation week?", expectedSource: "orientation-guide.md" },
  { category: "Orientation", query: "What should I bring to orientation?", expectedSource: "orientation-guide.md" },
  { category: "Orientation", query: "How do I recognize an orientation leader?", expectedSource: "orientation-guide.md" },

  // Policies
  { category: "Policies", query: "What is the smoking policy on campus?", expectedSource: "campus-policies.md" },
  { category: "Policies", query: "How much does a parking permit cost?", expectedSource: "campus-policies.md" },

  // Facilities
  { category: "Facilities", query: "What time does the cafeteria close?", expectedSource: "campus-facilities.md" },
  { category: "Facilities", query: "Where can I play pool or arcade games?", expectedSource: "campus-facilities.md" },

  // Academics
  { category: "Academics", query: "Who is the head of the Computing and AI department?", expectedSource: "academic-departments.md" },

  // No good result — genuinely absent from the knowledge base (Step 21/22)
  { category: "Out of scope", query: "Where can I get a driver's license?", expectNoResult: true },
  { category: "Out of scope", query: "Does Arcadia have a study abroad program in Japan?", expectNoResult: true },
];
