"use client";

import { Client } from "boardgame.io/react";
import { GHQGame, newOnlineGHQGame } from "@/game/engine";
import { GHQBoard } from "@/game/board";
import { SocketIO } from "boardgame.io/multiplayer";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_URL } from "../config";
import MultiplayerReplayCapability from "@/game/MultiplayerReplayCapability";

const GameClient = Client({
  game: newOnlineGHQGame({}),
  board: GHQBoard,
  multiplayer: SocketIO({ server: API_URL }),
  debug: false,
});

const OfflineGameClient = Client({
  game: GHQGame,
  board: GHQBoard,
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

  const [onlineClient, setOnlineClient] = useState<any | null>(null);
  const [offlineClient, setOfflineClient] = useState<any | null>(null);
  const [useOnlineGameClient, setUseOnlineGameClient] =
    useState<boolean>(false);

  return (
    <div>
      {matchId && (
        <>
          {onlineClient && offlineClient && (
            <MultiplayerReplayCapability
              offlineClient={offlineClient}
              onlineClient={onlineClient}
              setUseOnlineGameClient={setUseOnlineGameClient}
            />
          )}
          <div className={useOnlineGameClient ? "" : "hidden"}>
            <GameClient
              ref={(ref) => setOnlineClient(ref?.client)}
              matchID={matchId}
              playerID={playerId}
              credentials={credentials}
            />
          </div>
          <div className={useOnlineGameClient ? "hidden" : ""}>
            <OfflineGameClient
              ref={(ref) => setOfflineClient(ref?.client)}
              playerID={playerId}
            />
          </div>
          <BottomOfflineBanner
            useOnlineGameClient={useOnlineGameClient}
            setUseOnlineGameClient={setUseOnlineGameClient}
          />
        </>
      )}
    </div>
  );
}

function BottomOfflineBanner({
  useOnlineGameClient,
  setUseOnlineGameClient,
}: {
  useOnlineGameClient: boolean;
  setUseOnlineGameClient: (bool: boolean) => void;
}) {
  return (
    !useOnlineGameClient && (
      <button
        className="fixed bottom-0 left-0 w-full text-yellow-900 bg-yellow-200 hover:bg-yellow-300 p-1"
        onClick={() => setUseOnlineGameClient(true)}
      >
        You are currently reviewing this game in offline mode. Click here to
        switch back to the live game.
      </button>
    )
  );
}
