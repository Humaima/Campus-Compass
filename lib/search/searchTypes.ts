export interface CampusSearchResult {
  id: string;
  name: string;
  type: string;
  description: string;
  score: number;
  matchedBy: string[];
}