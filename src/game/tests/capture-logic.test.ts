import { describe, expect, it } from "@jest/globals";
import { GHQState } from "@/game/engine";
import { movesForActivePiece } from "@/game/move-logic";
import {
  Blue,
  initialBoardSetup,
  initialBoardSetupWithAnAirborneBack,
  initialBoardSetupWithAnAirborneNotBack,
  initialBoardSetupWithAnArmored,
  Red,
} from "@/game/tests/test-boards";
import { captureCandidates } from "@/game/capture-logic";

describe("computing allowed captures", () => {
  it("captures one piece when two on cardinal sides", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, Blue.INFANTRY, null, null, null, null, null, null],
      [null, Red.INFANTRY, Blue.INFANTRY, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(captureCandidates([2, 1], board)).toEqual([[3, 1]]);
  });
});
