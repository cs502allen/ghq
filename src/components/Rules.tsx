import Image from "next/image";

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
        <div className="text-xl">Pieces</div>
        <div>One Board with 64 squares</div>
        <div>36 playing pieces (18 per player, broken down below):</div>

        <div className="flex flex-col gap-1 px-4 mt-1">
          <div className="flex gap-2 items-center">
            <Image src="/hq-red.png" alt="hq" width={20} height={20} />
            <div>HQ (1) – Must capture to win game. Moves one square</div>
          </div>

          <div className="flex gap-2 items-center">
            <Image
              src="/regular-infantry-red.png"
              alt="regular infantry"
              width={20}
              height={20}
            />
            <div>Regular Infantry (8) – Moves one square</div>
          </div>
          <div className="flex gap-2 items-center">
            <Image
              src="/armored-infantry-red.png"
              alt="armored infantry"
              width={20}
              height={20}
            />
            <div>Armored Infantry (3) – Moves one or two squares</div>
          </div>
          <div className="flex gap-2 items-center">
            <Image
              src="/paratrooper-infantry-red.png"
              alt="airborne infantry"
              width={20}
              height={20}
            />
            <div>Airborne Infantry (1) – Moves one square or paradrops</div>
          </div>
          <div className="flex gap-2 items-center">
            <Image
              src="/regular-artillery-red.png"
              alt="regular artillery"
              width={20}
              height={20}
            />
            <div>
              Regular Artillery (3) – Moves one square and bombards two squares
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Image
              src="/armored-artillery-red.png"
              alt="armored artillery"
              width={20}
              height={20}
            />
            <div>
              Armored Artillery (1) – Moves one or two squares and bombards two
              squares
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Image
              src="/heavy-artillery-red.png"
              alt="heavy artillery"
              width={20}
              height={20}
            />
            <div>
              Heavy Artillery (1) – Moves one square and bombards three squares
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-xl">Setup</div>
        Each player sets up five of their pieces as shown. All other pieces
        start off the board in Reserve, and may enter the game on future turns.
        TODO(tyler): add screenshot
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xl">Taking a turn</div>
        The blue player takes the first turn. On your turn you perform two
        steps:
        <div className="px-4">
          <span className="font-bold">Captures:</span> If the other player moved
          pieces where they could be captured, or left them where they were
          being attacked, remove them now (see Capturing on pg 4).
        </div>
        <div className="px-4">
          <span className="font-bold">Take three Actions: </span>Captures may
          also occur during these Actions.
        </div>
        <div>There are three possible actions:</div>
        <div className="px-4">
          <div>
            <span className="font-bold">A.</span> Move a piece on the board
          </div>

          <div>
            <span className="font-bold">B.</span> Place a piece from your
            Reserve onto any empty square on their back row
          </div>

          <div>
            <span className="font-bold">C.</span> Rotate an artillery to face a
            new direction
          </div>
        </div>
        <div className="border border-yellow-600 bg-yellow-100 rounded px-2 py-1">
          Important: The same piece may not be used in more than one Action, but
          the same action can be taken multiple times with different pieces.
          Example: For your first action you place a Regular infantry from your
          Reserve into the back row. That same infantry can not be moved during
          the second or third action. You can,
        </div>
      </div>
    </div>
  );
}
