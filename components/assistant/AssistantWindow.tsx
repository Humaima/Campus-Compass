"use client";

import { useEffect, useRef, useState } from "react";
import PixelButton from "@/components/ui/PixelButton";
import PixelInput from "@/components/ui/PixelInput";
import { campusGuide } from "@/lib/ai/campusGuide";
import type { ChatMessage } from "@/lib/ai/conversationTypes";
import type { CampusGuideResponse } from "@/lib/ai/responseTypes";
import { useCampus } from "@/components/campus/CampusProvider";
import { buildings } from "@/data/buildings";
import { getBuildingIcon } from "@/lib/campus/buildingIcons";
import { HIGH_CONFIDENCE_THRESHOLD, MEDIUM_CONFIDENCE_THRESHOLD } from "@/lib/rag/confidenceThreshold";
import BuildingActionCard from "./BuildingActionCard";

type DisplayMessage = ChatMessage & {
  sources?: CampusGuideResponse["sources"];
  action?: CampusGuideResponse["action"];
  confidence?: CampusGuideResponse["confidence"];
};

type Props = { onView: (id: string) => void; onDirections: (id: string) => void; onStartQuest: (id: string) => void; initialQuestion?: string | null; onInitialQuestionHandled?: () => void };

// Step 11.2 — shown on first open so a new student knows what's actually
// answerable, instead of facing a blank input.
const SUGGESTED_QUESTIONS = [
  { icon: "📚", label: "Where can I study?" },
  { icon: "🖨️", label: "Where can I print?" },
  { icon: "🍴", label: "Where can I eat?" },
  { icon: "🧭", label: "Take me to the library." },
];

// Step 11.4 — mirrors lib/rag/confidenceThreshold.ts's tiers. Only shown for
// answers that actually carry a `confidence` (RAG-backed or a deterministic
// structured lookup) — a plain fallback message has no tier to report.
function confidenceBadge(confidence?: number) {
  if (confidence === undefined) return null;
  if (confidence >= HIGH_CONFIDENCE_THRESHOLD) return null; // reads as a plain, unhedged answer — no badge needed.
  if (confidence >= MEDIUM_CONFIDENCE_THRESHOLD) {
    return <div className="mt-2 text-[11px] font-bold text-navy/70">🟡 MEDIUM CONFIDENCE — SEE SOURCE BELOW</div>;
  }
  return <div className="mt-2 text-[11px] font-bold text-brick">❓ LOW CONFIDENCE — TRY REPHRASING FOR A BETTER ANSWER</div>;
}

export default function AssistantWindow({ onView, onDirections, onStartQuest, initialQuestion, onInitialQuestionHandled }: Props) {
  const { player, selectedBuilding, activeDestination, activeQuest, completedQuests, questProgress, recordGuideQuestion } = useCampus();
  const currentBuilding = buildings.find((b) => b.id === player.currentLocation);
  const currentLocationName = currentBuilding
    ? `${getBuildingIcon(currentBuilding.id)} ${currentBuilding.name}`
    : player.currentLocation;
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    setError(null);
    setInput("");
    // Captured before the state update below, so the request sends
    // everything up to (not including) this new question — history, not
    // history-plus-itself.
    const historyForRequest: ChatMessage[] = messages.map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const response = await campusGuide(question, historyForRequest, {
        currentLocation: player.currentLocation,
        selectedBuilding,
        activeDestination,
        activeQuest,
        completedQuests,
        activeQuestStepsCompleted: activeQuest ? questProgress[activeQuest] ?? [] : [],
      });
      // Day 12 — "asked the guide a question" is satisfied by sending one,
      // not by getting a good answer; the pipeline itself already handles
      // low-confidence/not-found cases separately.
      recordGuideQuestion();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
          sources: response.sources,
          action: response.action,
          confidence: response.confidence,
        },
      ]);
    } catch {
      // Step 22 — the pipeline itself already catches LLM/RAG failures and
      // returns a safe CampusGuideResponse; this only fires if the request
      // never reached it at all (e.g. a network drop).
      setError("Something went wrong reaching the Campus Guide. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialQuestion || loading) return;
    void send(initialQuestion);
    onInitialQuestionHandled?.();
  }, [initialQuestion]);

  function runAction(action?: CampusGuideResponse["action"]) {
    if (!action || action.type === "NONE" || !action.target) return null;

    // Step 11.3 — one shared campus-integrated card for both "show me X"
    // and "take me to X": either way, the student can equally use a look
    // and a guided route, so both buttons are offered together.
    if (action.type === "SHOW_BUILDING" || action.type === "GET_DIRECTIONS") {
      return <BuildingActionCard buildingId={action.target} onView={onView} onDirections={onDirections} />;
    }

    if (action.type === "START_QUEST") {
      return (
        <div className="mt-3">
          <PixelButton className="!text-xs" onClick={() => onStartQuest(action.target!)}>
            🎒 START QUEST
          </PixelButton>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="pixel-panel text-ink">

        <div className="bg-navy text-parchment border-b-4 border-navy p-4 font-display text-xs flex items-center justify-between">
          <span>🤖 CAMPUS GUIDE</span>
          {/* Step 11.1 — makes contextual awareness visible, not just a
              behind-the-scenes detail baked into the prompt: the student
              can see exactly what "here" resolves to. */}
          <span className="text-[10px] font-sans font-normal normal-case opacity-80">
            📍 {currentLocationName}
          </span>
        </div>

        <div className="p-5">

          {messages.length === 0 && (
            <div className="border-2 border-navy bg-cream p-4 text-sm">
              👋 Hi! I&apos;m your Arcadia Campus Guide.
              <br />
              <br />
              What can I help you find?
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {messages.map((message, index) =>
              message.role === "user" ? (
                <div key={index} className="self-end max-w-[85%] border-2 border-navy bg-green text-parchment px-3 py-2 text-sm">
                  {message.content}
                </div>
              ) : (
                <div key={index} className="self-start max-w-[85%] border-2 border-navy bg-cream px-3 py-2 text-sm">
                  🤖 <span className="whitespace-pre-line">{message.content}</span>

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-navy/30 text-xs opacity-70">
                      {message.sources.length === 1 ? (
                        <>📚 Source: {message.sources[0].title}</>
                      ) : (
                        <>
                          📚 Sources:
                          {message.sources.map((source) => (
                            <div key={source.source}>• {source.title}</div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {confidenceBadge(message.confidence)}

                  {runAction(message.action)}
                </div>
              )
            )}

            {loading && (
              <div className="self-start max-w-[85%] border-2 border-navy bg-cream px-3 py-2 text-sm opacity-70">
                🤖 CONSULTING CAMPUS DATABASE... ████████░░
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {messages.length === 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold mb-2">WHAT CAN I HELP YOU FIND?</p>
              <div className="flex flex-col gap-2">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question.label}
                    onClick={() => send(question.label)}
                    className="text-left border-2 border-navy bg-green text-parchment px-3 py-2 text-sm font-bold cursor-pointer hover:brightness-110"
                  >
                    {question.icon} {question.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-brick">⚠️ {error}</p>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-5 flex gap-2"
          >
            <PixelInput value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Campus Guide..." />
            {/* No onClick here: PixelButton's <button> has no explicit type,
                so inside this <form> it's a submit button by default —
                clicking it already triggers onSubmit above. Adding an
                onClick too would fire send() twice per click. */}
            <PixelButton>SEND</PixelButton>
          </form>

        </div>

      </div>
    </div>
  );
}
