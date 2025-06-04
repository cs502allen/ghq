"use client";
import React, { PropsWithChildren, useContext, useState } from "react";
import { GHQState } from "@/game/engine";
import { LogEntry } from "boardgame.io";

const emptyBoard: GHQState["board"] = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
];

const LatestMoveContext = React.createContext<{
  board: GHQState["board"];
  moves: LogEntry[];
  setMoves: (moves: LogEntry[]) => void;
  setBoard: (board: GHQState["board"]) => void;
}>({} as any);

export function LatestMoveProvider(props: PropsWithChildren) {
  const [board, setBoard] = useState<GHQState["board"]>(emptyBoard);
  const [moves, setMoves] = useState<LogEntry[]>([]);

  return (
    <LatestMoveContext.Provider value={{ board, moves, setMoves, setBoard }}>
      {props.children}
    </LatestMoveContext.Provider>
  );
}

export function useLatestMoveContext() {
  return useContext(LatestMoveContext)!;
}
