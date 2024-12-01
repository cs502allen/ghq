"use client";

import { Button } from "./ui/button";
import {
  shouldUseBoardV2,
  useBoardV1,
  useBoardV2,
} from "./board/board-switcher";

export default function Rules() {
  function toggleBoard() {
    if (shouldUseBoardV2()) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useBoardV1();
    } else {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useBoardV2();
    }
  }

  const nextBoardVersion = shouldUseBoardV2() ? "v1" : "v2";

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        GHQ is a game of strategy and tactics for two players. Players alternate
        turns moving pieces on the board, attempting to capture their
        opponent&apos;s HQ to win the game.
      </div>
      <div>
        It was originally designed by{" "}
        <a
          className="text-blue-600 hover:text-blue-400"
          href="https://www.vonnegutgame.com/"
        >
          Kurt Vonnegut
        </a>
        .
      </div>

      <div>
        The physical game was developed by Geoff Engelstein (see his great{" "}
        <a
          className="text-blue-600 hover:text-blue-400"
          href="https://www.youtube.com/watch?v=zfXPIhvFPjw"
        >
          How To Play GHQ
        </a>{" "}
        video).
      </div>

      <div>
        <Button
          variant="outline"
          className="h-6 px-2 text-xs"
          onClick={toggleBoard}
        >
          Use {nextBoardVersion}
        </Button>
      </div>
    </div>
  );
}
