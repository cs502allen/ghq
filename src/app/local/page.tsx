"use client";

import { Client } from "boardgame.io/react";
import { newLocalGHQGame } from "@/game/engine";
import { useState } from "react";
import ReplayCapability from "@/game/ReplayCapability";
import { GHQBoardV2 } from "@/components/board/boardv2";
import { shouldUseBoardV2 } from "@/components/board/board-switcher";
import { GHQBoard } from "@/game/board";

const App = Client({
  game: newLocalGHQGame(),
  board: shouldUseBoardV2() ? GHQBoardV2 : GHQBoard,
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
