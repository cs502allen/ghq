"use client";

import { API_URL } from "./live/config";
import { ghqFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { DateTime } from "luxon";
import classNames from "classnames";

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
      })
      .finally(() => setLoading(false));
  }, [isSignedIn]);

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
        {games.map((game: Game) => (
          <a
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
              </div>
              <div className="flex gap-1">
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

            <div className="flex flex-col justify-end items-end">
              <div>{game.status.toLowerCase()}</div>

              <div className="text-gray-500">
                {DateTime.fromISO(game.createdAt).toRelative()}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
