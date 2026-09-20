export type IntentType =
  | "SEARCH_BUILDING"
  | "SEARCH_SERVICE"
  | "GET_DIRECTIONS"
  | "ASK_INFORMATION"
  | "FIND_CATEGORY"
  | "START_QUEST"
  | "UNKNOWN";

export interface CampusIntent {
  intent: IntentType;
  query: string;
  target?: string;
  category?: string;
}