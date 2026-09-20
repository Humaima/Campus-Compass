"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { buildings } from "@/data/buildings";
import { METERS_PER_PIXEL, toCampusPoint, toMapPercent } from "@/data/campus";
import { getNearestBuilding } from "@/lib/routing/getNearestBuilding";
import { isNearDestination } from "@/lib/routing/isNearDestination";
import { useCampusClock } from "@/lib/campus/useCampusClock";
import { TIME_OF_DAY_META } from "@/lib/campus/timeOfDay";
import { useCampus } from "./CampusProvider";
import Player from "./Player";
import PlayerController from "./PlayerController";
import ControlsHint from "@/components/ui/ControlsHint";
import LocationHUD from "./LocationHUD";
import InteractionPrompt from "./InteractionPrompt";
import RouteHint from "./RouteHint";
import DestinationReached from "./DestinationReached";
import BuildingInfo from "./BuildingInfo";
import MobileControls from "./MobileControls";
import Route from "./Route";
import DestinationMarker from "./DestinationMarker";
import Minimap from "./Minimap";

// How close (in map percent) the player needs to be before a building
// counts as "nearby" for the E-to-interact prompt. getNearestBuilding()
// always returns *some* building regardless of distance, so without this
// cutoff "nearby" would mean "anywhere on the map."
const INTERACTION_RANGE = 10;

// Same idea for route-following: how close counts as "arrived" at a
// waypoint. Buildings vary a lot in footprint — approaching the Sports
// Center from a corner can leave the player over 16% from its center while
// still touching its wall — so this needs to comfortably cover the largest
// building's worst case, not just a typical one.
const ARRIVAL_RANGE = 16;

// No props: everything this needs — player position, the selected
// building, the active route — now comes from CampusProvider, the same
// shared state the AI Guide reads and writes through the same actions
// (see components/campus/CampusProvider.tsx). A building selected by
// clicking it here and a building selected by asking the AI Guide produce
// identical state; this component has no way to tell the two apart, by
// design (Day 8, Step 6).
export default function CampusMap() {
  // A provider action legitimately changes callback identity as it updates
  // shared state. Remembering an already-handled route stop prevents that
  // render from treating the same physical arrival as a new one.
  const handledRouteStop = useRef<string | null>(null);

  const {
    player,
    setPlayer,
    selectedBuilding: selectedBuildingId,
    closeSelectedBuilding,
    selectBuilding,
    activeRoute,
    activeDestination,
    startNavigation,
    clearNavigation,
    askAboutBuilding,
  } = useCampus();

  const selectedBuilding = selectedBuildingId ? buildings.find((b) => b.id === selectedBuildingId) ?? null : null;

  // Day 14 — Step 14.4: a subtle lighting tint over the map, keyed off the
  // same clock the HUD header shows (app/page.tsx). null before the first
  // client-side tick, and for afternoon (the map's own baseline light) —
  // both render as no overlay at all.
  const { timeOfDay } = useCampusClock();
  const tint = timeOfDay ? TIME_OF_DAY_META[timeOfDay].tint : null;

  // player.x/y live in pixel space (0-CAMPUS_WIDTH/HEIGHT) — the space
  // PlayerController/movePlayer/checkCollision all share with
  // data/collision.ts's zones. Every building coordinate and the rendered
  // map, though, are percent space (0-100) — data/buildings.ts's x/y.
  // This is the one place those two spaces meet, so it's the one place
  // that needs the conversion.
  const playerPercent = toMapPercent(player.x, player.y);

  // The route text shown inside the popup only applies to the building the
  // popup is currently showing — if a route is active toward a *different*
  // building than the one selected right now, the popup shows nothing,
  // rather than a stale "GET DIRECTIONS" result for whichever building was
  // selected when it was requested.
  const popupRoute = activeDestination && activeDestination === selectedBuildingId ? activeRoute : null;

  // Derived, not its own state: the player has "arrived" exactly when
  // there's an active destination and they're standing at it. Dismissing
  // the celebration (clearNavigation) clears activeDestination, which
  // makes this naturally fall away too — no separate "have I already
  // shown this modal" flag to keep in sync.
  const arrivedBuilding =
    activeDestination && activeDestination === player.currentLocation
      ? (buildings.find((b) => b.id === activeDestination) ?? null)
      : null;
  const destinationBuilding = activeDestination
    ? buildings.find((building) => building.id === activeDestination) ?? null
    : null;

  // The building closest to the player, but only counted as "nearby" once
  // actually within interaction range — otherwise it's just whichever
  // building happens to be least far away, even from across the map.
  const closestBuilding = getNearestBuilding(playerPercent.x, playerPercent.y);
  const nearbyBuilding =
    closestBuilding &&
    isNearDestination(playerPercent.x, playerPercent.y, closestBuilding.x, closestBuilding.y, INTERACTION_RANGE)
      ? closestBuilding
      : null;

  // LocationHUD's distance readout — the destination's pixel-space point,
  // measured against the player's own pixel-space position (the same space
  // PlayerController/movePlayer work in), then converted to a flavor
  // distance-in-meters via METERS_PER_PIXEL.
  const destinationHUD = destinationBuilding
    ? (() => {
        const target = toCampusPoint(destinationBuilding.x, destinationBuilding.y);
        const distancePixels = Math.hypot(target.x - player.x, target.y - player.y);
        return { name: destinationBuilding.name, distanceMeters: distancePixels * METERS_PER_PIXEL };
      })()
    : null;

  // Let the user close the popup with Escape wherever their focus is.
  useEffect(() => {
    if (!selectedBuilding) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeSelectedBuilding();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBuilding, closeSelectedBuilding]);

  // Two ways to interact now: click a building, or walk up to it and press
  // E. Both call the same selectBuilding() action so they behave
  // identically — same as the AI Guide's SHOW_BUILDING action.
  useEffect(() => {

    const handleInteraction = (
      event: KeyboardEvent
    ) => {

      if (event.key.toLowerCase() !== "e") {
        return;
      }

      if (nearbyBuilding) {
        selectBuilding(nearbyBuilding.id);
      }
    };

    window.addEventListener(
      "keydown",
      handleInteraction
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleInteraction
      );
    };

  }, [nearbyBuilding, selectBuilding]);

  // PlayerController only knows how to move an { x, y } point — it doesn't
  // know about quests or location, so adapt its updates onto the full
  // player model instead of handing it setPlayer directly.
  //
  // Wrapped in useCallback (with setPlayer, a React-guaranteed-stable
  // useState setter, as its only dependency) so this function keeps the
  // same identity across renders. Without that, a fresh function was
  // created on every render — and movement itself causes CampusMap to
  // re-render every animation frame — so PlayerController's `useEffect`
  // (which depends on this prop) tore down and restarted its
  // requestAnimationFrame loop and event listeners on nearly every frame.
  // Each restart reset the loop's elapsed-time tracking, so most frames
  // computed a ~0 time delta and produced no movement: holding an arrow
  // key barely moved the player, making repeated taps feel like the only
  // way to make progress.
  const setPlayerPosition: Dispatch<SetStateAction<{ x: number; y: number }>> = useCallback((update) => {
    setPlayer((previous) => {
      const next = typeof update === "function" ? update(previous) : update;
      return { ...previous, x: next.x, y: next.y };
    });
  }, [setPlayer]);

  // Walking-based arrival: watch the player's position against both the
  // next suggested waypoint and the final destination (in case of a
  // shortcut past the ones in between). Reaching either calls the same
  // selectBuilding() action a click would — quest completion and route
  // progress happen the same way whether the player walked there or
  // clicked/asked to teleport there.
  //
  // Tolerant of shortcuts: BFS picks the shortest graph path, not
  // necessarily the most walkable one, so a player may well head straight
  // for the final destination instead of touching every suggested waypoint
  // in order.
  useEffect(() => {
    if (activeRoute.length === 0) return;

    const currentIndex = activeRoute.indexOf(player.currentLocation);
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextId = activeRoute[safeIndex + 1];
    const finalId = activeRoute[activeRoute.length - 1];

    for (const id of new Set([nextId, finalId])) {
      if (!id) continue;
      const target = buildings.find((b) => b.id === id);
      if (!target) continue;

      if (isNearDestination(playerPercent.x, playerPercent.y, target.x, target.y, ARRIVAL_RANGE)) {
        const arrivalKey = `${activeDestination ?? "route"}:${target.id}`;
        if (handledRouteStop.current === arrivalKey) break;
        handledRouteStop.current = arrivalKey;
        selectBuilding(target.id);
        break;
      }
    }
  }, [player.x, player.y, player.currentLocation, activeRoute, activeDestination, selectBuilding]);

  useEffect(() => {
    // A new destination must be allowed to use the same building as a stop.
    handledRouteStop.current = null;
  }, [activeDestination]);

  return (
    <div className="relative w-full max-w-6xl mx-auto aspect-[8/5]">

      {/* Step 13.3/13.4 — a single flattened PNG background (not the
          original ~174MB SVG), served through next/image so it's resized
          and re-encoded (WebP/AVIF, per browser support) automatically for
          each viewport instead of shipping one fixed-size file to every
          device. `fill` needs the parent to carry the image's own aspect
          ratio (aspect-[8/5] above, matching CAMPUS_WIDTH:CAMPUS_HEIGHT in
          data/campus.ts) since there's no intrinsic box to size from
          otherwise. */}
      <Image
        src="/assets/Campus_Map.png"
        alt="Arcadia University Campus"
        fill
        priority
        sizes="(min-width: 1280px) 1152px, 100vw"
        className="object-contain [image-rendering:pixelated]"
      />

      {tint && <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: tint }} />}

      {/* Building interaction zones — invisible; centered on each building's x,y */}
      {buildings.map((building) => (
        <button
          key={building.id}
          onClick={() => selectBuilding(building.id)}
          aria-label={building.name}
          className="absolute w-20 h-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{
            left: `${building.x}%`,
            top: `${building.y}%`,
          }}
        />
      ))}

      {activeRoute.length > 1 && !arrivedBuilding && <Route route={activeRoute} />}
      {destinationBuilding && !arrivedBuilding && <DestinationMarker building={destinationBuilding} />}

      <LocationHUD currentBuildingName={closestBuilding?.name ?? null} destination={destinationHUD} />
      <Minimap playerPercent={playerPercent} destinationId={activeDestination} />
      <ControlsHint />
      <InteractionPrompt building={nearbyBuilding} />

      {activeRoute.length > 0 && !arrivedBuilding && (
        <RouteHint
          buildingName={
            buildings.find((b) => b.id === activeRoute[Math.max(activeRoute.indexOf(player.currentLocation), 0) + 1])
              ?.name ?? ""
          }
        />
      )}

      {arrivedBuilding && (
        <DestinationReached
          building={arrivedBuilding}
          completedQuests={player.completedQuests}
          onDismiss={clearNavigation}
        />
      )}

      {/* Player marker — reads its own x/y from the player model, not a building lookup */}
      <PlayerController
        setPosition={setPlayerPosition}
      />
      <Player
        x={playerPercent.x}
        y={playerPercent.y}
      />

      {selectedBuilding && (
        <BuildingInfo
          building={selectedBuilding}
          currentRoute={popupRoute}
          onClose={closeSelectedBuilding}
          onGetDirections={() => startNavigation(selectedBuilding.id)}
          onAskGuide={() => askAboutBuilding(selectedBuilding.id)}
        />
      )}

      <MobileControls
        onInteract={() => nearbyBuilding && selectBuilding(nearbyBuilding.id)}
        canInteract={Boolean(nearbyBuilding)}
      />
    </div>
  );
}
