import { buildings } from "@/data/buildings";
import { quests } from "@/data/quests";

export type CampusAction =
  | { type: "SHOW_BUILDING"; target: string }
  | { type: "GET_DIRECTIONS"; target: string }
  | { type: "START_QUEST"; target: string }
  | { type: "NONE" };

type Handlers = {
  showBuilding: (target: string) => void;
  getDirections: (target: string) => void;
  startQuest: (target: string) => void;
};

// The validation boundary between an AI-proposed action and campus state.
// Unknown ids never reach component state or the routing engine.
export function executeCampusAction(action: CampusAction, handlers: Handlers): boolean {
  if (action.type === "NONE") return true;
  if (action.type === "START_QUEST") {
    if (!quests.some((quest) => quest.id === action.target)) return false;
    handlers.startQuest(action.target);
    return true;
  }
  if (!buildings.some((building) => building.id === action.target)) return false;
  if (action.type === "SHOW_BUILDING") handlers.showBuilding(action.target);
  if (action.type === "GET_DIRECTIONS") handlers.getDirections(action.target);
  return true;
}
