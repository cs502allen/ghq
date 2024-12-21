"use client";

import { API_URL } from "./live/config";
import { ghqFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { DateTime } from "luxon";
import classNames from "classnames";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Game {
  id: string;
  winner: string;
  player1: string;
  player1Elo: number;
  player2: string;
  player2Elo: number;
  status: string;
  createdAt: string;
}

export default function LiveGamesList() {
  const { isSignedIn, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [page, setPage] = useState(0);
  const [pageGames, setPageGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);

    ghqFetch<{ matches: Game[] }>({
      url: `${API_URL}/matches`,
      getToken,
      method: "GET",
    })
      .then((data) => {
        setGames(data.matches ?? []);
        setPage(0);
      })
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  useEffect(() => {
    const start = page * 10;
    const end = start + 10;
    setPageGames(games.slice(start, end));
  }, [page, games]);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-2xl">Recent games</div>

      {!loading && games.length === 0 && (
        <div className="text-gray-600">No games found</div>
      )}
      {loading && (
        <div className="flex flex-col gap-2">
          <div className="py-2 px-3 bg-gray-300 animate-pulse border border-gray-200 rounded-lg h-20"></div>
          <div className="py-2 px-3 bg-gray-300 animate-pulse border border-gray-200 rounded-lg h-20"></div>
          <div className="py-2 px-3 bg-gray-300 animate-pulse border border-gray-200 rounded-lg h-20"></div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {pageGames.map((game: Game) => (
          <Link
            key={game.id}
            href={`/live/${game.id}`}
            className="py-2 px-3 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md flex justify-between"
          >
            <div className="tracking-tight">
              <div className="flex gap-1">
                <div
                  className={classNames(
                    game.player1 === game.winner && "text-green-700"
                  )}
                >
                  {game.player1}
                </div>{" "}
                ({game.player1Elo})<span className="text-gray-500"> vs.</span>
                <div
                  className={classNames(
                    game.player2 === game.winner && "text-green-700"
                  )}
                >
                  {game.player2}
                </div>{" "}
                ({game.player2Elo})
              </div>
            </div>

            <div className="flex gap-1 items-center text-sm">
              <div>{(game.status ?? "ongoing").toLowerCase()}</div>

              <div className="text-gray-500">
                {DateTime.fromISO(game.createdAt).toRelative()}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => page > 0 && setPage(page - 1)}
          disabled={page === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={page >= Math.ceil(games.length / 10) - 1}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
