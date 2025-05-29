import {
  defaultBoard,
  defaultReserveFleet,
  emptyReserveFleet,
  GHQState,
  ReserveFleet,
} from "@/game/engine";
import { B, R } from "@/game/tutorial";
import { BoardArrowType } from "@/game/BoardArrow";
import { MoveLog } from "@/app/tutorial/types";
import { bombardedSquares } from "@/game/move-logic";

export type TutorialFrame = {
  slug: string;
  heading: string;
  details: string;
  disablePlay?: true;
  board: GHQState["board"];
  redReserve?: ReserveFleet;
  blueReserve?: ReserveFleet;
  arrows?: BoardArrowType[];
  didMove?: (
    board: GHQState["board"],
    moves: MoveLog[],
    next: () => void,
    reset: () => void,
    message: (text: string) => void
  ) => void;
};

export const frames: (TutorialFrame & {
  slugWithIndex: string;
  redReserve: ReserveFleet;
  blueReserve: ReserveFleet;
  arrows: BoardArrowType[];
})[] = [];
function addFrame(frame: TutorialFrame) {
  if (frames.find((i) => i.slug === frame.slug)) {
    throw new Error("Duplicate tutorial slug " + frame.slug);
  }

  frames.push({
    ...frame,
    slugWithIndex: `${frames.length + 1}-${frame.slug}`,
    blueReserve: frame.blueReserve || defaultReserveFleet,
    redReserve: frame.redReserve || defaultReserveFleet,
    arrows: frame.arrows || [],
  });
}

/// Add tutorial frames here. Order matters.

addFrame({
  slug: "hq",
  heading: "GHQ is played by two players on an 8x8 board",
  details: "The goal of the game is to capture your opponent's HQ (the star)️.",
  disablePlay: true,
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
});

addFrame({
  slug: "setup",
  heading: "The game starts with these pieces on the board",
  details:
    "The arrow pieces are called Infantry. The tank pieces are called Artillery.",
  board: defaultBoard,
  disablePlay: true,
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
});

addFrame({
  slug: "reserve-intro",
  heading: "Each player gets a set of Reserve pieces",
  details: "These begin off-board and can be deployed as part of one's turn.",
  board: defaultBoard,
  disablePlay: true,
});

addFrame({
  slug: "a-turn",
  heading: "In GHQ players get 3 moves per Turn ",
  details:
    "They can move a piece, deploy from their reserve, or rotate an Artillery piece without moving it.",
  board: defaultBoard,
});

addFrame({
  slug: "moving-infantry",
  heading: "Infantry can move one square in any direction",
  details: "Try moving a piece on the tutorial board.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, R.IN, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (last) {
      if (last.type === "Move" && last.unitType === "INFANTRY") {
        next();
      } else {
        message("That's not an infantry!");
      }
    }
  },
});

addFrame({
  slug: "moving-armored-infantry",
  heading: "Move an Armored Infantry",
  details: "Armored Infantry can move two squares in any one direction.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, R.AI, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length && last) {
      if (last.type === "Move" && last.unitType === "ARMORED_INFANTRY") {
        next();
      } else {
        message("That's not an armored infantry!");
      }
    }
  },
});

addFrame({
  slug: "moving-artillery",
  heading: "Move and Aim Artillery",
  details:
    "Every time you move Artillery, you also get to aim it. Point it at the enemy HQ.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, B.HQ, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, R.AR, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length && last) {
      const bombarded = bombardedSquares(board);
      console.log(bombarded);
      if (last.type === "MoveAndOrient" && Boolean(bombarded["2,2"])) {
        next();
      } else {
        message("You didn't aim at Blue's HQ. Try again!");
        reset();
      }
    }
  },
});

addFrame({
  slug: "heavy-artillery",
  heading:
    "Each Player gets one Heavy Artillery (shoots far) and one Armored Artillery (moves fast)",
  details: "Try moving them to see their abilities.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, B.HQ, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, R.HA, null, R.AA, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const hasTwo = moves.filter((i) => i.type === "MoveAndOrient").length === 2;
    if (hasTwo) next();
  },
});

addFrame({
  slug: "taking-up-space-artillery",
  heading: "Artillery 'bombards' squares",
  details:
    "Players are not allowed to move any of their pieces into squares bombarded by an enemy. Notice how the Blue Artillery limits your Infantry's mobility.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, B.HA, null, B.AR, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, R.IN, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (last) {
      if (last.type === "Move" && last.unitType === "INFANTRY") {
        next();
      } else {
        message("That's not an infantry!");
      }
    }
  },
});

addFrame({
  slug: "deploying",
  heading: "Now deploy some Reinforcements",
  details:
    "Click a piece in your Reserve and then choose any square on the back rank to deploy it.",
  redReserve: defaultReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (last && last.type === "Reinforce") {
      next();
    }
  },
});

addFrame({
  slug: "capturing-1",
  heading: "Capturing Infantry",
  details: "Infantry cannot capture other Infantry on their own.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, B.IN, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, R.IN, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (last) {
      if (last.type === "Move" && last.unitType === "INFANTRY") {
        next();
      }
    }
  },
});

addFrame({
  slug: "capturing-2",
  heading: "Outnumber the enemy to Capture their Infantry",
  details:
    "Together Infantry can capture enemy Infantry. A two-on-one will win the piece. Try to capture the Blue Infantry.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, B.IN, null, null, null, null],
    [null, null, null, null, R.IN, null, null, null],
    [null, null, null, R.IN, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length === 2 && last.type === "Move" && last.capturedPiece) {
      return next();
    }
    if (moves.length === 1) {
      message("Great one more move!");
    } else if (moves.length === 2) {
      message("That's not it. Try to surround the piece next time");
      reset();
    }
  },
});

addFrame({
  slug: "capturing-3",
  heading: "Infantry can defend each other too",
  details:
    "Because Blue's Infantry are defending each other, there's no way to get a two-on-one on either of them. They're playing solid GHQ.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, B.IN, null, null, null, null],
    [null, null, B.IN, null, R.IN, null, null, null],
    [null, null, null, R.IN, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    if (moves.length === 2) next();
  },
});
addFrame({
  slug: "capturing-4",
  heading: "Outnumber enemy Infantry to capture their pieces.",
  details: "Can you figure out how to capture an infantry?",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, B.IN, null, null, null, null],
    [null, null, B.IN, null, R.IN, null, null, null],
    [null, null, R.IN, R.IN, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length > 1 && last.type === "Move" && last.capturedPiece) {
      return next();
    }
    if (moves.length === 3) {
      message("That didn't work. Try again!");
      reset();
    }
  },
});

addFrame({
  slug: "capturing-artillery",
  heading: "Artillery is easier to capture",
  details:
    "A single Infantry captures artillery if you move next to it. Note: diagonal does not count.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, B.AR, null, null, null, null],
    [null, null, null, null, R.IN, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length > 0) {
      if (last.type === "Move" && last.capturedPiece) {
        return next();
      } else {
        message("Line up next to the artillery");
        reset();
      }
    }
  },
});

addFrame({
  slug: "capturing-artillery-defended",
  heading: "Defending Artillery",
  details:
    "Artillery can be defended using Infantry because Infantry will 'engage' (attack) each other first. The same move won't work here.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, B.IN, null, null, null],
    [null, null, null, B.AR, null, null, null, null],
    [null, null, null, null, R.IN, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length > 0) {
      next();
    }
  },
});

addFrame({
  slug: "capturing-artillery-defended-show-us",
  heading: "Defend your Artillery",
  details:
    "You can defend your Artillery the same way. Where would you move your Infantry to defend your Artillery?",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, B.IN, null, null],
    [null, null, null, B.IN, null, null, null, null],
    [null, null, null, null, R.AR, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, R.IN, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    console.log(moves);
    const last = moves[moves.length - 1];
    if (
      last &&
      last.type === "Move" &&
      last.unitType === "INFANTRY" &&
      last.to[0] === 4 &&
      last.to[1] === 3
    ) {
      return next();
    }

    if (moves.length) {
      message("Not there! Or Infantry to D5 will capture your Artillery");
      reset();
    }
  },
});

addFrame({
  slug: "airborne",
  heading: "And now: the most powerful piece in the game",
  details:
    "Each Player gets one Airborne Infantry that can parachute anywhere on the board in a moment's notice. Try it out!",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, R.AB, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length) {
      if (
        last &&
        last.type === "Move" &&
        last.unitType === "AIRBORNE_INFANTRY"
      ) {
        next();
      } else {
        reset();
      }
    }
  },
});

addFrame({
  slug: "airborne-2",
  heading: "Captures like any other Infantry",
  details:
    "What makes the Airborne so deadly is that it captures just like any other Infantry. Undefended Artillery beware! Try capturing Blue's Heavy.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, B.HA, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, R.AB, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length) {
      if (
        last &&
        last.type === "Move" &&
        last.unitType === "AIRBORNE_INFANTRY" &&
        last.capturedPiece
      ) {
        return next();
      } else {
        reset();
      }
    }
  },
});

addFrame({
  slug: "airborne-3",
  heading:
    "You can also use it to get unexpected two-on-one's against Infantry",
  details: "Team up with your Basic Infantry to Capture Red's Armored Infantry.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, B.AI, null, null, null, null, null, null],
    [null, R.IN, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, R.AB, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length) {
      if (
        last &&
        last.type === "Move" &&
        last.unitType === "AIRBORNE_INFANTRY" &&
        last.capturedPiece
      ) {
        return next();
      } else {
        reset();
      }
    }
  },
});

addFrame({
  slug: "airborne-4",
  heading: "The Airborne can only jump from the back rank",
  details:
    "Once it's in the game it behaves like a normal Infantry. Pro tip: if you walk it home you can use it again.",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, B.IN, null, null, null, null, null],
    [null, R.AB, null, null, null, null, null, null],
    [null, R.IN, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length === 2) {
      if (last && last.type === "Move" && last.capturedPiece) {
        return next();
      } else {
        reset();
      }
    }
  },
});

addFrame({
  slug: "summary",
  heading: "That's GHQ",
  details:
    "3 Moves a Turn. Capture Infantry with 2:1s. Defend your Artillery. Have fun! If all goes well your game will end like this. To finish this tutorial capture the enemy HQ!!!",
  redReserve: emptyReserveFleet,
  blueReserve: emptyReserveFleet,
  board: [
    [null, null, B.AR, B.IN, null, null, null, null],
    [null, null, null, null, B.HQ, null, null, null],
    [null, null, null, null, null, R.IN, null, null],
    [null, null, null, null, R.IN, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  didMove: (board, moves, next, reset, message) => {
    const last = moves[moves.length - 1];
    if (moves.length === 2) {
      if (last && last.type === "Move" && last.capturedPiece) {
        return next();
      } else {
        reset();
      }
    }
  },
});
