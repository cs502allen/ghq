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
        It was developed by Geoff Engelstein (watch his great{" "}
        <a
          className="text-blue-600 hover:text-blue-400"
          href="https://www.youtube.com/watch?v=zfXPIhvFPjw"
        >
          How To Play GHQ
        </a>{" "}
        video).
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

      <div className="flex flex-col gap-2">
        <div className="text-xl">Setup</div>
        <div>
          Each player sets up five of their pieces as shown. All other pieces
          start off the board in Reserve, and may enter the game on future
          turns.
        </div>
        <Image
          src="/rules/setup.png"
          alt="setup"
          width={300}
          height={300}
          className="mx-auto"
        />
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
        <Note>
          Important: The same piece may not be used in more than one Action, but
          the same action can be taken multiple times with different pieces.
          Example: For your first action you place a Regular infantry from your
          Reserve into the back row. That same infantry can not be moved during
          the second or third action. You can,
        </Note>
      </div>

      <div>
        <div className="text-lg">Moving pieces</div>
        <div className="flex flex-col gap-2">
          <div>
            Only one piece may occupy a square at the same time. You may not
            move a piece onto or through a square that contains another friendly
            or enemy piece.
          </div>
          <div>Most pieces may move one square to an adjacent square.</div>
          <div className="flex gap-2 items-center justify-center">
            <Image src="/hq-red.png" alt="hq" width={64} height={64} />

            <Image
              src="/regular-infantry-red.png"
              alt="hq"
              width={64}
              height={64}
            />
            <Image
              src="/regular-artillery-red.png"
              alt="hq"
              width={64}
              height={64}
            />
            <Image
              src="/heavy-artillery-red.png"
              alt="hq"
              width={64}
              height={64}
            />
            <Image
              src="/rules/moving-regular.png"
              alt="moving-regular"
              width={200}
              height={200}
            />
          </div>
          <div>
            <span className="font-bold">Armored Infantry</span> and{" "}
            <span className="font-bold">Armored Artillery</span> can move one or
            two squares in any of the eight directions, as shown in the image.
            Note that if moving two squares the piece may not change direction
            in the middle of the move. So it can only end on one of the squares
            shown. Also, a piece that moves two squares may not jump over an
            adjacent piece. As a reminder, pieces that can move two spaces have
            two black circles on them.
          </div>
          <div>
            <div className="flex gap-2 items-center justify-center">
              <Image
                src="/rules/armored-pieces.png"
                alt="moving-regular"
                width={200}
                height={200}
              />
              <Image
                src="/rules/moving-armored.png"
                alt="moving-regular"
                width={200}
                height={200}
              />
            </div>
          </div>
          <div>
            The <span className="font-bold">Airborne Infantry</span> moves in a
            special way. There are two types of moves the airborne infantry may
            make. First, it may always move as a normal infantry, one square in
            any direction. Or, if it is currently located on its own back row,
            it may paradrop onto any empty square on the board. It may capture
            when it drops. If the airborne infantry returns to the back row it
            may paradrop again on subsequent turns.
          </div>
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/paratrooper-infantry-red.png"
              alt="hq"
              width={64}
              height={64}
            />
            <Image
              src="/rules/moving-airborne.png"
              alt="moving-regular"
              width={100}
              height={100}
            />
          </div>
          <Note>
            Note: Turning infantry units to help clarify engagements and
            captures is always free, does not cost an action, and may be done at
            any time. (See Capturing on pg 4 for details).
          </Note>
          <Note>
            Note: No piece may move into or through a space under bombardment by
            an enemy artillery unit.
          </Note>
        </div>
      </div>

      <div>
        <div className="text-lg">Adding pieces from your reserve</div>
        <div className="flex flex-col gap-2">
          <div>
            On your turn you may add any one piece from your Reserve to any
            empty space in your back row using an action.
          </div>
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/rules/reserving.png"
              alt="moving-regular"
              width={400}
              height={200}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-lg">Rotate an artillery piece</div>
        <div className="flex flex-col gap-2">
          <div>
            Artillery always have a specific facing. Using an action, the
            artillery can be turned to face in any of eight directions while
            remaining in the same square.
          </div>
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/rules/rotating.png"
              alt="moving-regular"
              width={100}
              height={100}
            />
          </div>
          <Note>
            Important: When an artillery piece makes a move action, it can be
            turned to face any direction for free after moving. The rotate
            action is used when that artillery piece is staying in place during
            your turn.
          </Note>
        </div>
      </div>

      <div>
        <div className="text-xl">Capturing</div>
        <div className="flex flex-col gap-2">
          <div>
            Captured pieces are permanently removed from the game and cannot
            re-enter. They do not go into Reserve.
          </div>
          <Note>
            Important: Infantry, Armored Infantry, and Airborne Infantry all
            capture and are captured the same way.
          </Note>
          <Note>
            Important: Artillery, Armored Artillery, and Heavy Artillery all
            capture and are captured in the same way, except that Heavy
            Artillery shoots three spaces instead of two.
          </Note>
        </div>
      </div>

      <div>
        <div className="text-lg">Infantry capturing infantry</div>
        <div className="flex flex-col gap-2">
          <div>
            If there is just one friendly and enemy infantry adjacent to each
            other, they are engaged and do not capture each other. It is
            considered a standoff. The players may rotate the infantry to face
            each other to make it simpler to track which pieces are engaged.
          </div>
          <div>
            If a second infantry is moved adjacent to an enemy that is already
            in a standoff, the enemy will be captured. HOWEVER, if the moving
            piece is adjacent to more than one enemy piece, at least one of
            which is not engaged, the moving piece must engage that enemy and
            cannot capture (See example on pg 6).
          </div>
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/rules/engaging-1.png"
              alt="moving-regular"
              width={100}
              height={100}
            />
            <Image
              src="/rules/engaging-2.png"
              alt="moving-regular"
              width={160}
              height={100}
            />
          </div>
          <div>
            An infantry can only capture one piece when it moves. If it moves
            into a position where it can capture more than one piece, the moving
            player chooses which piece to capture.
          </div>
          <Note>
            Important: Infantry may cause captures when they are adjacent to
            enemy units, but NOT diagonally. (Note that infantry can move
            diagonally, but not capture diagonally). Infantry capture artillery
            differently. (See page 5).
          </Note>
          <div>
            An infantry that is engaged with an enemy may still move, but the
            square it moves to (first square for armored infantry) must not be a
            square where it would also engage an infantry, even if that would
            cause a capture.
          </div>
        </div>
      </div>

      <div>
        <div className="text-lg">Infantry capturing artillery</div>
        <div className="flex flex-col gap-2">
          <div>
            Unlike when capturing infantry, a single infantry is enough to
            capture an artillery unit. It simply needs to be adjacent to the
            artillery, and it is captured. There are two exceptions to this:
          </div>
          <div className="pl-4">
            • An artillery may not be captured by an infantry that is directly
            facing the front of the artillery.
          </div>
          <div className="pl-4">
            • An infantry may not capture an artillery if there is another
            unengaged infantry it can engage instead.
          </div>
          <div>
            Since infantry cannot attack diagonally, if an artillery is facing
            the side of a square it can be captured from three different
            directions. But if it is facing a diagonal it can be captured from
            all four directions.
          </div>
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/rules/capture-artillery-1.png"
              alt="moving-regular"
              width={100}
              height={100}
            />
            <Image
              src="/rules/capture-artillery-2.png"
              alt="moving-regular"
              width={200}
              height={100}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-lg">Capturing with artillery</div>
        <div className="flex flex-col gap-2">
          <div>
            Unlike infantry, artillery do not capture when they move. They
            capture at the start of their turn if any enemy units remain in
            squares that they are attacking. So enemy units have a chance to
            move away before being captured, or the artillery can be captured.
          </div>
          <div>
            Artillery always have a specific facing, which can include
            diagonally. After moving, the artillery can be turned to face in any
            direction. Artillery can also rotate in place using an action (see
            Actions on pg 4).
          </div>
          <div>
            Artillery bombard either two or three squares in the direction they
            are facing. Any enemy units that are in any of those squares at the
            start of the artillery unit’s next turn are captured.
          </div>
          <div className="pl-4">
            • Friendly units in bombarded squares are not affected.
          </div>
          <div className="pl-4">
            • Pieces in the way do not block squares from being attacked by an
            artillery unit.
          </div>
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/rules/artillery-range.png"
              alt="moving-regular"
              width={400}
              height={200}
            />
            <Image
              src="/rules/artillery-capture.png"
              alt="moving-regular"
              width={200}
              height={200}
            />
          </div>
          <Note>
            Note on Capturing: Remember that moving an infantry piece can only
            cause one capture. However if a capture situation still remains in
            place at the start of that player’s next turn, the capture will take
            place if the enemy has not moved out of the way or engaged the
            infantry. This is a ‘free’ capture and happens at the start of the
            turn before any actions take place, at the same time as artillery
            captures.
          </Note>
        </div>
      </div>

      <div>
        <div className="text-lg">Capturing headquarters</div>
        <div className="flex flex-col gap-2">
          <div>
            HQ’s may not capture enemy units. They are captured in the same
            manner as infantry, when engaged by two infantry or under an
            artillery bombardment they cannot escape from.
          </div>
        </div>
      </div>

      <div>
        <div className="text-xl">Winning</div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 justify-center items-center text-xl font-bold text-red-600">
            IF YOU CAPTURE THE ENEMY’S HQ YOU WIN THE GAME!
            <div className="flex gap-2">
              <Image src="/hq-red.png" alt="hq" width={64} height={64} />
              <Image src="/hq-blue.png" alt="hq" width={64} height={64} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-lg">Infantry vs. infantry examples</div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/rules/infantry-vs-infantry.png"
              alt="moving-regular"
              width={600}
              height={300}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-lg">Infantry vs. artillery examples</div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/rules/infantry-vs-artillery.png"
              alt="moving-regular"
              width={600}
              height={300}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-lg">General examples</div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/rules/general-examples.png"
              alt="moving-regular"
              width={600}
              height={300}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-lg">Artillery examples</div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/rules/artillery-examples.png"
              alt="moving-regular"
              width={600}
              height={300}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-lg">HQ example</div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/rules/hq-example.png"
              alt="moving-regular"
              width={400}
              height={200}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-yellow-600 bg-yellow-100 rounded px-2 py-1">
      {children}
    </div>
  );
}
