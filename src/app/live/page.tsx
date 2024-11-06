"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useEffect, useState } from "react";
import { API_URL } from "./config";
import { PlayOnlineButton } from "./PlayOnlineButton";

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
  const [games, setGames] = useState<Game[]>([]);
  const [userId, setUserId] = useState<string>(
    (typeof localStorage !== "undefined" && localStorage.getItem("userId")) ||
      ""
  );

  // TODO(tyler): add clerk auth

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

  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  async function playLocal() {
    router.push("/");
  }

  return (
    <div className="p-2 flex flex-col gap-4">
      <div className="text-4xl font-bold text-emerald-800">GHQ</div>
      <TextInput userId={userId} setUserId={setUserId} />
      <div className="flex gap-2">
        <PlayOnlineButton />
        <Button onClick={playLocal}>👨‍💻 Play local</Button>
      </div>

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
