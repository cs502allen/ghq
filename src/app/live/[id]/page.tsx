"use client";

import { Client } from "boardgame.io/react";
import { OnlineGHQGame } from "@/game/engine";
import { GHQBoard } from "@/game/board";
import { SocketIO } from "boardgame.io/multiplayer";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const GameClient = Client({
  game: OnlineGHQGame,
  board: GHQBoard,
  multiplayer: SocketIO({ server: "localhost:8000" }),
});

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>("0");

  params.then(({ id }) => setMatchId(id));

  useEffect(() => {
    const playerId = searchParams.get("playerId") ?? "0";
    setPlayerId(playerId);
  }, [searchParams]);

  return (
    <div>{matchId && <GameClient matchID={matchId} playerID={playerId} />}</div>
  );
}
