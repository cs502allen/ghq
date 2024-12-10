"use client";

import { GHQState } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";

import PlayArea from "./PlayArea";
import Sidebar from "./Sidebar";
import GameoverDialog from "./GameoverDialog";
import { useState } from "react";
import { Settings } from "./SettingsMenu";

export function GHQBoardV2(props: BoardProps<GHQState>) {
  const [settings, setSettings] = useState<Settings>({ autoFlipBoard: true });
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar
        className="order-3 md:order-1"
        {...props}
        settings={settings}
        setSettings={setSettings}
      />
      <PlayArea
        className="order-1 md:order-2 m-auto"
        {...props}
        settings={settings}
      />
      <GameoverDialog G={props.G} gameover={props.ctx.gameover} />
    </div>
  );
}
