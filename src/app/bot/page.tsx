"use client";

import { Client } from "boardgame.io/react";
import { useState } from "react";
import { GHQBoard } from "@/game/board";
import ReplayCapability from "@/game/ReplayCapability";
import { Local } from "boardgame.io/multiplayer";
import { MCTSBot } from "boardgame.io/ai";
import { newBotGame } from "@/game/bot";

// From https://github.com/boardgameio/boardgame.io/issues/7 so we can pass in custom iterations/playoutDepth
class CustomMCTSBot extends MCTSBot {
  constructor(opts: any) {
    super({ ...opts, ...opts.game.ai });
  }
}

const App = Client({
  game: newBotGame(),
  board: GHQBoard,
  multiplayer: Local({ bots: { "1": CustomMCTSBot } }),
});

export default function Page() {
  const [client, setClient] = useState<any | null>(null);

  return (
    <div>
      {client && <ReplayCapability client={client} />}
      <App ref={(ref) => setClient(ref?.client)} playerID="0" />
    </div>
  );
}
