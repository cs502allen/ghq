"use client";

import { Client } from "boardgame.io/react";
import { useEffect, useState } from "react";
import { GHQBoard } from "@/game/board";
import ReplayCapability from "@/game/ReplayCapability";
import { BoardType, newTutorialGHQGame } from "@/game/tutorial";
import { useSearchParams } from "next/navigation";
import { boards } from "@/game/tutorial";

export default function Page() {
  const searchParams = useSearchParams();
  const [client, setClient] = useState<any | null>(null);
  const [App, setApp] = useState<any | null>(null);

  useEffect(() => {
    const boardType = searchParams.get("boardType") as BoardType;
    if (!boardType) {
      return;
    }

    const DynamicApp = Client({
      game: newTutorialGHQGame({ boardType }),
      board: GHQBoard,
    });
    setApp(() => DynamicApp);
  }, [searchParams]);

  if (!App) {
    return (
      <div className="p-2 flex flex-col gap-4">
        <div className="text-2xl">Lessons</div>
        <div className="flex flex-wrap gap-1">
          {Object.keys(boards).map((boardType: string) => (
            <a
              key={boardType}
              href={`/learn?boardType=${boardType}`}
              className="py-3 px-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md min-w-96"
            >
              <div className="tracking-tight text-gray-900">{boardType}</div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {client && <ReplayCapability client={client} />}
      {App && <App ref={(ref: any) => setClient(ref?.client)} />}
    </div>
  );
}
