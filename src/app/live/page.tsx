"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { API_URL } from "./config";
import { PlayOnlineButton } from "./PlayOnlineButton";
import { ghqFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Learn } from "@/components/Learn";

interface Game {
  id: string;
  player1: string;
  player2: string;
  status: string;
}

function App() {
  const router = useRouter();
  const { user } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    ghqFetch<{ matches: Game[] }>({
      url: `${API_URL}/matches`,
      getToken,
      method: "GET",
    }).then((data) => {
      setGames(
        data?.matches?.map((match: any) => ({
          id: match.id,
          player1: match.usernames[0],
          player2: match.usernames[1],
          status: `Turn ${match.state.ctx.turn}`,
        })) ?? []
      );
    });
  }, [isSignedIn]);

  async function playLocal() {
    router.push("/");
  }

  async function playBot() {
    router.push("/bot");
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-2 flex flex-col gap-4">
      <div className="text-4xl font-bold text-emerald-800">GHQ</div>
      <div className="flex gap-2">
        <PlayOnlineButton />
        <Button onClick={playLocal}>👨‍💻 Play local</Button>
        <Button onClick={playBot}>🤖 Play bot</Button>
      </div>

      <Learn />

      <div className="text-2xl mt-2">Live games</div>
      <div className="flex flex-col gap-2">
        {games.map((game: Game) => (
          <a
            key={game.id}
            href={`/live/${game.id}`}
            className="py-2 px-3 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md"
          >
            <div className="text-xl font-bold tracking-tight text-gray-900">
              {game.player1} vs {game.player2}
            </div>
            <p className="font-normal text-gray-600">{game.status}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export default App;
