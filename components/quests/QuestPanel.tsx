import { quests } from "@/data/quests";
import { achievements } from "@/data/achievements";
import PixelButton from "@/components/ui/PixelButton";

type QuestPanelProps = {
  completedQuests: string[];
  // Day 12 — per-quest completed step ids, keyed by quest id (see
  // CampusProvider). Drives the checklist below; a quest in
  // `completedQuests` is treated as fully checked regardless of what this
  // holds for it (belt-and-braces against the two ever disagreeing).
  questProgress: Record<string, string[]>;
  activeQuestId?: string | null;
  onStartQuest?: (questId: string) => void;
  onGuideTo?: (buildingId: string) => void;
};

export default function QuestPanel({ completedQuests, questProgress, activeQuestId, onStartQuest, onGuideTo }: QuestPanelProps) {
  return (
    <div className="p-6">

      <h2 className="font-display text-lg mb-5 text-navy">
        🎒 Orientation Quests
      </h2>

      <div className="space-y-3">

        {quests.map((quest) => {
          const isComplete = completedQuests.includes(quest.id);
          const isActive = activeQuestId === quest.id;
          const doneStepIds = new Set(questProgress[quest.id] ?? []);
          const reward = achievements.find((a) => a.id === quest.achievementId);
          const nextStep = quest.steps.find((step) => !isComplete && !doneStepIds.has(step.id));

          return (
            <div
              key={quest.id}
              className={`
                pixel-panel
                text-ink
                p-4
                ${isComplete ? "bg-green/10" : ""}
                ${isActive ? "outline outline-4 outline-gold outline-offset-2" : ""}
              `}
            >

              <h3 className="font-display text-xs tracking-wide">
                {quest.icon} {quest.title.toUpperCase()}
              </h3>

              <p className="text-sm mt-2">
                {quest.description}
              </p>

              <ul className="mt-3 space-y-1 text-sm">
                {quest.steps.map((step) => {
                  const stepDone = isComplete || doneStepIds.has(step.id);
                  return (
                    <li key={step.id} className={`flex gap-2 ${stepDone ? "line-through opacity-60" : ""}`}>
                      <span>{stepDone ? "☑" : "□"}</span>
                      <span>{step.label}</span>
                    </li>
                  );
                })}
              </ul>

              {isActive && !isComplete && (
                <div className="mt-3">
                  <p className="text-xs font-bold">
                    {nextStep ? `Next: ${nextStep.label}` : "Follow the map to get started."}
                  </p>
                  {nextStep?.targetBuildingId && (
                    <PixelButton
                      variant="green"
                      className="mt-2 !text-xs"
                      onClick={() => onGuideTo?.(nextStep.targetBuildingId!)}
                    >
                      🧭 GUIDE ME
                    </PixelButton>
                  )}
                </div>
              )}

              {!isComplete && !isActive && (
                <PixelButton className="mt-3 !text-xs" onClick={() => onStartQuest?.(quest.id)}>START QUEST</PixelButton>
              )}

              {isComplete && reward && (
                <p className="text-xs mt-3">
                  Reward: {reward.icon} {reward.title}
                </p>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}
