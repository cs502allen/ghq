import { GHQState } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";

import PlayArea from "./PlayArea";
import Sidebar from "./Sidebar";

export function GHQBoardV2(props: BoardProps<GHQState>) {
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar className="order-3 md:order-1" {...props} />
      <PlayArea className="order-1 md:order-2 m-auto" {...props} />
    </div>
  );
}
