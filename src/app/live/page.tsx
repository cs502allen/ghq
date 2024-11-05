"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import MatchmakingModal from "./MatchmakingModal";
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./config";

interface Game {
  id: string;
  player1: string;
  player2: string;
  status: string;
}

function TextInput({
  userId,
  setUserId,
}: {
  userId: string;
  setUserId: (userId: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor="userId"
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        User ID
      </label>
      <input
        type="text"
        id="userId"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder="John"
        required
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

function App() {
  const router = useRouter();
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [userId, setUserId] = useState<string>("");

  // TODO(tyler): add clerk auth

  const checkMatchmaking = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(
          `${API_URL}/matchmaking?userId=${userId}`,
          {
            method: "POST",
          }
        );
        const data = await response.json();
        if (data.match) {
          setIsMatchmaking(false);
          const playerId = data.match.playerId;
          localStorage.setItem(
            `credentials:${data.match.id}:${playerId}`,
            data.match.credentials
          );
          router.push(`/live/${data.match.id}?playerId=${playerId}`);
        }
      } catch (error) {
        console.error("Error polling matchmaking API:", error);
      }
    },
    [router]
  );

  async function playOnline() {
    if (!userId) {
      alert("User ID is required");
      return;
    }

    setIsMatchmaking(true);
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMatchmaking) {
      checkMatchmaking(userId);
      interval = setInterval(() => checkMatchmaking(userId), 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMatchmaking, userId, checkMatchmaking]);

  async function cancelMatchmaking() {
    setIsMatchmaking(false);
    fetch(`${API_URL}/matchmaking?userId=${userId}`, {
      method: "DELETE",
    });
  }

  useEffect(() => {
    fetch(`${API_URL}/matches`)
      .then((res) => res.json())
      .then((res) => {
        const games = res.matches.map((match: any) => ({
          id: match.id,
          player1: match.state.G.userIds["0"],
          player2: match.state.G.userIds["1"],
          status: `Turn ${match.state.ctx.turn}`,
        }));
        setGames(games);
      });
  }, []);

  async function playLocal() {
    router.push("/");
  }

  return (
    <div className="p-2 flex flex-col gap-4">
      <div className="text-4xl font-bold text-emerald-800">GHQ</div>
      <TextInput userId={userId} setUserId={setUserId} />
      <div className="flex gap-2">
        <Button onClick={playOnline} loadingText="Searching...">
          🌎 Play online
        </Button>
        <Button onClick={playLocal}>👨‍💻 Play local</Button>
      </div>

      {isMatchmaking && <MatchmakingModal onCancel={cancelMatchmaking} />}

      <div className="text-2xl mt-2">Live games</div>

      <div className="flex flex-col gap-2">
        {games.map((game: Game) => (
          <a
            key={game.id}
            href={`/live/${game.id}`}
            className="max-w-sm py-2 px-3 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md"
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
