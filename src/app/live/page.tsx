"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import MatchmakingModal from "./MatchmakingModal";
import { useCallback, useEffect, useState } from "react";

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
  // TODO(tyler): add ability to spectate games

  const checkMatchmaking = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(
          `http://localhost:8000/matchmaking?userId=${userId}`,
          {
            method: "POST",
          }
        );
        const data = await response.json();
        if (data.match) {
          setIsMatchmaking(false);
          const playerId = data.match.players["0"] === userId ? "0" : "1";
          router.push(`/live/${data.match.id}?playerId=${playerId}`);
        }
        console.log(data);
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
      interval = setInterval(() => checkMatchmaking(userId), 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMatchmaking, userId, checkMatchmaking]);

  async function cancelMatchmaking() {
    setIsMatchmaking(false);
    fetch(`http://localhost:8000/matchmaking?userId=${userId}`, {
      method: "DELETE",
    });
  }

  useEffect(() => {
    fetch("http://localhost:8000/matches")
      .then((res) => res.json())
      .then((res) => {
        console.log(res.matches[0]);
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
