"use client";

import { Client } from "boardgame.io/react";
import { useEffect, useState } from "react";
import { GHQBoard } from "@/game/board";
import ReplayCapability from "@/game/ReplayCapability";
import { BoardType, newTutorialGHQGame } from "@/game/tutorial";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const [client, setClient] = useState<any | null>(null);
  const [App, setApp] = useState<any | null>(null);

  useEffect(() => {
    const boardType = searchParams.get("boardType") as BoardType;
    const DynamicApp = Client({
      game: newTutorialGHQGame({ boardType }),
      board: GHQBoard,
    });
    setApp(() => DynamicApp);
  }, [searchParams]);

  return (
    <div>
      {client && <ReplayCapability client={client} />}
      {App && <App ref={(ref: any) => setClient(ref?.client)} />}
    </div>
  );
}
