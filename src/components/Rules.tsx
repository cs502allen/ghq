"use client";

export default function Rules() {
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
          target="_blank"
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
          target="_blank"
        >
          How To Play GHQ
        </a>{" "}
        video).
      </div>

      <div>
        This website is being actively developed on{" "}
        <a
          className="text-blue-600 hover:text-blue-400"
          href="https://github.com/acunniffe/ghq"
          target="_blank"
        >
          GitHub
        </a>
        .
      </div>
    </div>
  );
}
