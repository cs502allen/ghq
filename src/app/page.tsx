"use client";

import { Client } from "boardgame.io/react";
import { GHQGame } from "@/game/engine";
import { useState } from "react";
import { GHQBoard } from "@/game/board";
import ReplayCapability from "@/game/ReplayCapability";

const App = Client({
  game: GHQGame,
  debug: false,
  board: GHQBoard,
});

export default function Page() {
  const [client, setClient] = useState<any | null>(null);

  return (
    <div>
      {client && <ReplayCapability client={client} />}
      <App ref={(ref) => setClient(ref?.client)} />
    </div>
  );
}
