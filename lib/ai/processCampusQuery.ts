import { classifyIntent } from "./classifyIntent";
import { searchCampus } from "@/lib/search/searchCampus";

export function processCampusQuery(query: string) {
  const intent = classifyIntent(query);

  const results = searchCampus(intent.query);

  return {
    intent,
    results
  };
}