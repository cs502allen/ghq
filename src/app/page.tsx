"use client";

import Image from "next/image";
import { Client } from "boardgame.io/react";
import { GHQGame } from "@/game/engine";
import { useMemo } from "react";
import { GHQBoard } from "@/game/board";

const App = Client({
  game: GHQGame,
  board: GHQBoard,
});

export default App;
