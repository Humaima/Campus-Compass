"use client";

import { useState } from "react";
import PixelButton from "@/components/ui/PixelButton";
import PixelInput from "@/components/ui/PixelInput";
import { handleCampusQuery } from "@/lib/ai/handleCampusQuery";
import type { CampusIntent } from "@/lib/ai/intentTypes";
import { quests } from "@/data/quests";
import ChunkMarkdown from "./ChunkMarkdown";

type Props = { onView: (id: string) => void; onDirections: (id: string) => void; onStartQuest: (id: string) => void };

const quickActions: Array<{ label: string; icon: string; intent: CampusIntent }> = [
  { label: "Study", icon: "📚", intent: { intent: "SEARCH_SERVICE", query: "study", category: "study" } },
  { label: "Food", icon: "🍔", intent: { intent: "SEARCH_SERVICE", query: "food", category: "food" } },
  { label: "Print", icon: "🖨️", intent: { intent: "SEARCH_SERVICE", query: "printing", category: "printing" } },
  { label: "Student ID", icon: "🪪", intent: { intent: "SEARCH_SERVICE", query: "student id", category: "student id" } },
  { label: "Registration", icon: "📝", intent: { intent: "SEARCH_SERVICE", query: "registration", category: "registration" } },
  { label: "Directions", icon: "🧭", intent: { intent: "GET_DIRECTIONS", query: "directions" } },
];

export default function AISearchPanel({ onView, onDirections, onStartQuest }: Props) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof handleCampusQuery>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const building = result?.source === "campus" ? result.primaryResult : null;
  const topChunk = result?.source === "knowledge" && result.found ? result.chunks[0] : null;
  const quest = building ? quests.find((item) => item.steps.some((step) => step.targetBuildingId === building.id)) : undefined;

  async function search(input: string | CampusIntent = query) {
    setError(null);
    try {
      setResult(await handleCampusQuery(input));
    } catch {
      // The RAG call itself failed (network, rate limit, API outage) — this
      // is distinct from "the knowledge base has nothing relevant" (that's
      // result.found === false). Clear any stale result so the error isn't
      // shown alongside an unrelated answer from a previous query.
      setResult(null);
      setError("Something went wrong reaching the knowledge base. Please try again in a moment.");
    }
  }

  const understood = !result
    ? ""
    : result.source === "knowledge"
      ? `You want to know: ${result.intent.query}`
      : result.intent.intent === "SEARCH_SERVICE" && result.intent.category
        ? `You are looking for a place for ${result.intent.category}.`
        : result.intent.intent === "GET_DIRECTIONS"
          ? `You want directions to ${building?.name}.`
          : `You are looking for ${building?.name}.`;

  return <div className="p-6 max-w-2xl mx-auto"><div className="pixel-panel text-ink">
    <div className="p-5 border-b-4 border-navy">
      <h2 className="font-display text-lg text-navy">🔎 Campus Search</h2><p className="text-sm mt-2">Ask naturally, or choose a quick action.</p>
      <div className="mt-4 flex gap-2"><PixelInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Where can I print something?" /><PixelButton onClick={() => search()}>SEARCH</PixelButton></div>
      <p className="text-xs font-bold mt-5 mb-2">🤖 WHAT DO YOU NEED?</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{quickActions.map((action) => <button key={action.label} onClick={() => search(action.intent)} className="border-2 border-navy bg-green text-parchment p-2 text-sm font-bold cursor-pointer hover:brightness-110">{action.icon} {action.label}</button>)}</div>
    </div>
    {error && <p className="p-5 text-sm text-brick">⚠️ {error}</p>}
    {building && <div className="p-5"><p className="text-sm">🤖 <strong>I understood:</strong> {understood}</p><div className="mt-4 border-2 border-navy bg-cream p-4">
      <h3 className="font-bold text-lg">📍 {building.name}</h3><p className="capitalize text-sm mt-1">{building.services.slice(0, 3).join(" • ")}</p><p className="text-sm mt-3">{building.description}</p>
      <div className="mt-4 flex gap-2"><PixelButton variant="cream" className="!text-xs" onClick={() => onView(building.id)}>VIEW</PixelButton><PixelButton variant="green" className="!text-xs" onClick={() => onDirections(building.id)}>🧭 DIRECTIONS</PixelButton></div>
      {quest && <div className="mt-4 border-t-2 border-navy pt-3 text-sm"><p>This location is part of your Orientation Quest:</p><p className="font-bold mt-1">🎒 {quest.title}</p><PixelButton className="mt-2 !text-xs" onClick={() => onStartQuest(quest.id)}>START QUEST</PixelButton></div>}
    </div></div>}
    {result?.source === "knowledge" && topChunk && <div className="p-5"><p className="text-sm">🤖 <strong>I understood:</strong> {understood}</p><div className="mt-4 border-2 border-navy bg-cream p-4">
      <h3 className="font-bold text-lg">🤖 Campus Guide</h3>
      <ChunkMarkdown content={topChunk.content} />
      <p className="text-xs mt-3 pt-3 border-t-2 border-navy opacity-70">📚 Source: {topChunk.metadata.title} <span className="capitalize">({topChunk.metadata.category})</span></p>
    </div></div>}
    {result?.source === "knowledge" && !result.found && <div className="p-5"><div className="border-2 border-brick bg-brick/10 p-4 text-sm">
      <p>🤖 I couldn’t find reliable information about that in the Arcadia University knowledge base.</p>
      <p className="mt-3 font-bold">Try asking about:</p>
      <ul className="mt-1 list-none">
        <li>• Registration</li>
        <li>• Student Services</li>
        <li>• Library</li>
        <li>• Campus Facilities</li>
        <li>• Orientation</li>
      </ul>
    </div></div>}
    {result?.source === "campus" && !building && <p className="p-5 text-sm">I couldn’t match that to a campus location yet. Try a building or service.</p>}
  </div>
  </div>;
}
