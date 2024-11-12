"use client";

import { Client } from "boardgame.io/react";
import { useEffect, useState } from "react";
import { GHQBoard } from "@/game/board";
import ReplayCapability from "@/game/ReplayCapability";
import { BoardType, newTutorialGHQGame } from "@/game/tutorial";
import { useSearchParams } from "next/navigation";
import { boards } from "@/game/tutorial";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";

export default function Page() {
  const searchParams = useSearchParams();
  const [client, setClient] = useState<any | null>(null);
  const [App, setApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boardType = searchParams.get("boardType") as BoardType;
    if (!boardType) {
      setLoading(false);
      return;
    }

    const DynamicApp = Client({
      game: newTutorialGHQGame({ boardType }),
      board: GHQBoard,
    });
    setApp(() => {
      setLoading(false);
      return DynamicApp;
    });
  }, [searchParams]);

  if (!App) {
    return (
      <div className="p-2 flex flex-col gap-4 lg:px-48">
        <Header />

        {loading && (
          <div className="flex gap-1">
            <Loader2 className="animate-spin w-6 h-6" /> Loading...
          </div>
        )}
        {!loading && (
          <div className="flex flex-col gap-2 border rounded p-4 bg-slate-50">
            <div className="text-2xl">Lessons</div>
            <div className="flex flex-wrap gap-1">
              {Object.keys(boards).map((boardType: string) => (
                <a
                  key={boardType}
                  href={`/learn?boardType=${boardType}`}
                  className="py-3 px-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md min-w-96"
                >
                  <div className="tracking-tight text-gray-900">
                    {boardType}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
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
