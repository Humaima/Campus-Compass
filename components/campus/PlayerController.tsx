"use client";

import { useEffect, useRef } from "react";
import { PLAYER_SPEED } from "@/data/campus";
import { movePlayer } from "@/lib/routing/movePlayer";

type Position = { x: number; y: number };
type Props = { setPosition: React.Dispatch<React.SetStateAction<Position>> };

export default function PlayerController({ setPosition }: Props) {
  const keys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const MOVEMENT_KEYS = new Set(["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"]);
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (MOVEMENT_KEYS.has(key)) event.preventDefault();
      keys.current.add(key);
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    let frame = 0;
    let previousTime: number | null = null;
    const update = (time: number) => {
      const elapsedSeconds = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      let directionX = 0;
      let directionY = 0;
      if (keys.current.has("w") || keys.current.has("arrowup")) directionY -= 1;
      if (keys.current.has("s") || keys.current.has("arrowdown")) directionY += 1;
      if (keys.current.has("a") || keys.current.has("arrowleft")) directionX -= 1;
      if (keys.current.has("d") || keys.current.has("arrowright")) directionX += 1;

      const length = Math.hypot(directionX, directionY);
      if (length > 0) {
        const dx = (directionX / length) * PLAYER_SPEED * elapsedSeconds;
        const dy = (directionY / length) * PLAYER_SPEED * elapsedSeconds;
        setPosition((position) => movePlayer(position, dx, dy));
      }
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      cancelAnimationFrame(frame);
    };
  }, [setPosition]);

  return null;
}
