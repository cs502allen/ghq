"use client";

import { Client } from "boardgame.io/react";
import { useEffect, useState } from "react";
import ReplayCapability from "@/game/ReplayCapability";
import { Local } from "boardgame.io/multiplayer";
import { GHQBoardV2 } from "@/components/board/boardv2";
import { newGHQGameV2 } from "@/game/engine-v2";
import { useEngine } from "@/game/engine-v2";
import { Loader2 } from "lucide-react";
import { WorkerBot } from "./worker-bot-v2";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const [client, setClient] = useState<any | null>(null);
  const [App, setApp] = useState<any | null>(null);
  const { engine } = useEngine();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!engine) {
      return;
    }

    const fen = searchParams.get("fen") as string | undefined;

    const AppComponent = Client({
      game: newGHQGameV2({ engine, type: "bot", fen }),
      board: GHQBoardV2,
      multiplayer: Local({ bots: { "1": WorkerBot } }),
    });
    setApp(() => AppComponent);
  }, [engine, searchParams]);

  if (!App) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {client && <ReplayCapability client={client} />}
      <App ref={(ref: any) => setClient(ref?.client)} playerID="0" />
    </div>
  );
}
