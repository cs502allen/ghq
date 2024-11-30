import { Ctx, Game } from "boardgame.io";
import { GHQState } from "./engine";
import { isHqOnBoard } from "./gameover-logic";
import { getAllowedMoves } from "./board-moves";

export const ai: Game<GHQState>["ai"] = {
  // @ts-expect-error
  iterations: 500,
  playoutDepth: 10,
  enumerate: (G, ctx) => {
    const allowedMoves = getAllowedMoves({
      board: G.board,
      redReserve: G.redReserve,
      blueReserve: G.blueReserve,
      currentPlayerTurn: ctx.currentPlayer === "0" ? "RED" : "BLUE",
      thisTurnMoves: G.thisTurnMoves,
    });
    return allowedMoves.map(({ name, args }) => ({ move: name, args }));
  },
  objectives: () => {
    let lastEval = 0;

    const haveBetterEvalObjective = {
      checker: (G: GHQState, ctx: Ctx) => {
        lastEval = G.eval;
        return true;
      },
      weight: -1 * lastEval,
    };

    Object.defineProperty(haveBetterEvalObjective, "weight", {
      get: function () {
        return -1 * lastEval;
      },
      configurable: true,
      enumerable: true,
    });

    return {
      "capture-the-opponents-hq": {
        checker: (G: GHQState, ctx: Ctx) => {
          return isHqOnBoard(
            G.board,
            ctx.currentPlayer === "0" ? "BLUE" : "RED"
          );
        },
        weight: 1000,
      },
      "have-better-eval": haveBetterEvalObjective,
    };
  },
};
