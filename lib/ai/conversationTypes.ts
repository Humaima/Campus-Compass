export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Step 11: don't send the whole conversation forever. Keep the last few
// turns — enough for a follow-up like "what are its hours?" to still have
// the entity it refers to in view, without the prompt growing unbounded.
export const MAX_HISTORY_MESSAGES = 8;

export function trimHistory(history: ChatMessage[]): ChatMessage[] {
  return history.slice(-MAX_HISTORY_MESSAGES);
}
