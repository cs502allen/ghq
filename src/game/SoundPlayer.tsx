import { useEffect, useState } from "react";
import { playMoveSound, playCaptureSound } from "./audio";
import { Coordinate, GHQState } from "./engine";
import { Ctx } from "boardgame.io";

export function SoundPlayer({ ctx, G }: { ctx: Ctx; G: GHQState }) {
  const [prevMoves, setPrevMoves] = useState<Record<"0" | "1", Coordinate[]>>({
    "0": [],
    "1": [],
  });
  const [prevCaptures, setPrevCaptures] = useState<
    Record<"0" | "1", Coordinate[]>
  >({
    "0": [],
    "1": [],
  });

  useEffect(() => {
    if (
      G.lastTurnMoves["0"].length > prevMoves["0"].length ||
      G.lastTurnMoves["1"].length > prevMoves["1"].length
    ) {
      playMoveSound();
    }
    setPrevMoves(G.lastTurnMoves);
  }, [G.lastTurnMoves]);

  useEffect(() => {
    if (
      G.lastTurnCaptures["0"].length > prevCaptures["0"].length ||
      G.lastTurnCaptures["1"].length > prevCaptures["1"].length
    ) {
      playCaptureSound();
    }
    setPrevCaptures(G.lastTurnCaptures);
  }, [G.lastTurnCaptures]);
  return null;
}
