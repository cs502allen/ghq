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
  const [playerId, setPlayerId] = useState<string | undefined>();
  const [credentials, setCredentials] = useState<string>("");

  useEffect(() => {
    if (matchId) {
      setCredentials(
        localStorage.getItem(`credentials:${matchId}:${playerId}`) ?? ""
      );
    }
  }, [matchId]);

  params.then(({ id }) => setMatchId(id));

  useEffect(() => {
    const playerId = searchParams.get("playerId");
    if (playerId) {
      setPlayerId(playerId);
    }
  }, [searchParams]);

  return (
    <div>
      {matchId && (
        <GameClient
          matchID={matchId}
          playerID={playerId}
          credentials={credentials}
        />
      )}
    </div>
  );
}
