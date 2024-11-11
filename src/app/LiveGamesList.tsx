"use client";

import { API_URL } from "./live/config";
import { ghqFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface Game {
  id: string;
  player1: string;
  player2: string;
  status: string;
}

export default function LiveGamesList() {
  const { isSignedIn, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    setLoading(true);

    ghqFetch<{ matches: Game[] }>({
      url: `${API_URL}/matches`,
      getToken,
      method: "GET",
    })
      .then((data) => {
        setGames(
          data?.matches?.map((match: any) => ({
            id: match.id,
            player1: match.usernames[0],
            player2: match.usernames[1],
            status: `Turn ${match.state.ctx.turn}`,
          })) ?? []
        );
      })
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-2xl">Live games</div>

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
            className="py-2 px-3 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md"
          >
            <div className="tracking-tight">
              <div>
                {game.player1}
                <span className="text-gray-400"> vs.</span>
              </div>
              <div>{game.player2}</div>
            </div>
            <p className="text-gray-600">{game.status}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
