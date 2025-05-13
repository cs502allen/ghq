"use client";

import { Client } from "boardgame.io/react";
import { useState } from "react";
import ReplayCapability from "@/game/ReplayCapability";
import { Local } from "boardgame.io/multiplayer";
import { newBotGame } from "@/game/bot";
import { GHQBoardV2 } from "@/components/board/boardv2";
import { shouldUseBoardV2 } from "@/components/board/board-switcher";
import { GHQBoard } from "@/game/board";
import { WorkerBot } from "./worker-bot";

const App = Client({
  game: newBotGame(),
  board: shouldUseBoardV2() ? GHQBoardV2 : GHQBoard,
  multiplayer: Local({ bots: { "1": WorkerBot } }),
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
