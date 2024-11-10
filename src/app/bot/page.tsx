"use client";

import { Client } from "boardgame.io/react";
import { GHQGame } from "@/game/engine";
import { useState } from "react";
import { GHQBoard } from "@/game/board";
import ReplayCapability from "@/game/ReplayCapability";
import { Local } from "boardgame.io/multiplayer";
import { MCTSBot } from "boardgame.io/ai";

class CustomMCTSBot extends MCTSBot {
  constructor(opts: any) {
    super({ ...opts, ...opts.game.ai });
  }
}

const App = Client({
  game: GHQGame,
  board: GHQBoard,
  multiplayer: Local({ bots: { "1": CustomMCTSBot } }),
});

export default function Page() {
  const [client, setClient] = useState<any | null>(null);

  return (
    <div>
      {client && <ReplayCapability client={client} />}
      <App ref={(ref) => setClient(ref?.client)} playerID="0" />
      {/* <App ref={(ref) => setClient(ref?.client)} /> */}
    </div>
  );
}
