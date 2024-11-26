"use client";

import { Client } from "boardgame.io/react";
import { GHQGame } from "@/game/engine";
import { useState } from "react";
import ReplayCapability from "@/game/ReplayCapability";
import { GHQBoardV2 } from "@/game/boardv2";

const App = Client({
  game: GHQGame,
  board: GHQBoardV2,
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
