import { getQuestsForBuilding } from "@/lib/quests/getQuestsForBuilding";
import Crest from "@/components/ui/Crest";
import PixelButton from "@/components/ui/PixelButton";

type Props = {
  building: {
    id: string;
    name: string;
  };
  completedQuests: string[];
  onDismiss: () => void;
};

export default function DestinationReached({
  building,
  completedQuests,
  onDismiss,
}: Props) {
  const relatedQuests = getQuestsForBuilding(building.id);

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/40"
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-72 pixel-panel text-ink px-6 py-5 text-center"
      >
        <Crest size="sm" className="mx-auto w-fit" />

        <p className="mt-3 text-lg font-bold">🎉 DESTINATION REACHED!</p>

        <p className="mt-3 text-sm">You discovered:</p>
        <p className="font-bold">🏫 {building.name}</p>

        {relatedQuests.length > 0 && (
          <div className="mt-4 text-left text-sm">
            <p className="font-semibold">Quest progress:</p>
            {relatedQuests.map((quest) => (
              <p key={quest.id}>
                {completedQuests.includes(quest.id) ? "☑" : "□"} {quest.title}
              </p>
            ))}
          </div>
        )}

        <PixelButton variant="green" className="mt-4 w-full !text-sm" onClick={onDismiss}>
          Continue exploring
        </PixelButton>
      </div>
    </div>
  );
}
