import { CampusIntent } from "./intentTypes";

export function classifyIntent(query: string): CampusIntent {
  const text = query.toLowerCase();
  const category = [
    ["printing", ["print", "printing", "printer"]],
    ["study", ["study", "study room", "quiet place"]],
    ["food", ["food", "eat", "hungry", "coffee", "lunch"]],
    ["student id", ["student id", "id card"]],
    ["registration", ["registration", "register", "enrollment", "enroll"]],
  ].find(([, terms]) => (terms as string[]).some((term) => text.includes(term)))?.[0] as string | undefined;

  if (text.includes("tell me about") || text.includes("what is") || text.includes("information about")) {
    return { intent: "ASK_INFORMATION", query, category };
  }

  if (
    text.includes("where is") ||
    text.includes("where's") ||
    text.includes("location of") ||
    text.includes("help me find")
  ) {
    return {
      intent: "SEARCH_BUILDING",
      query,
      category
    };
  }

  if (
    text.includes("take me") ||
    text.includes("how do i get") ||
    text.includes("directions")
  ) {
    return {
      intent: "GET_DIRECTIONS",
      query,
      category
    };
  }

  if (
    text.includes("where can i") ||
    text.includes("can i") ||
    text.includes("need")
  ) {
    return {
      intent: "SEARCH_SERVICE",
      query,
      category
    };
  }

  if (
    text.includes("quest") ||
    text.includes("orientation")
  ) {
    return {
      intent: "START_QUEST",
      query
    };
  }

  return {
    intent: "UNKNOWN",
    query
  };
}
