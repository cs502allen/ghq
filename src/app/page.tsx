"use client";

import Image from "next/image";
import { Client } from "boardgame.io/react";
import { GHQGame } from "@/game/engine";
import { useEffect, useMemo, useRef, useState } from "react";
import { GHQBoard } from "@/game/board";
import ReplayCapability from "@/game/ReplayCapability";

const App = Client({
  game: GHQGame,
  board: GHQBoard,
});

export default function Page() {
  const appRef = useRef<any>(null);
  const [client, setClient] = useState<any | null>(null);

  useEffect(() => {
    setClient(appRef.current?.client);
  }, [appRef.current?.client]);

  return (
    <div>
      {client && <ReplayCapability client={client} />}
      <App ref={appRef} />
    </div>
  );
}
