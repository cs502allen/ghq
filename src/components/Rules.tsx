import Image from "next/image";
import Link from "next/link";

export default function Rules() {
  return (
    <div className="flex flex-col gap-3">
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
        See our{" "}
        <Link className="text-blue-600 hover:text-blue-400" href="/learn">
          learn
        </Link>{" "}
        page to play through some basic gameplay scenarios yourself!
      </div>
    </div>
  );
}
