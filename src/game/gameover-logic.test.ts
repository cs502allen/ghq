import { describe, expect, it } from "@jest/globals";
import { GHQState } from "@/game/engine";
import { Red, Blue } from "@/game/tests/test-boards";
import { getGameoverState } from "./gameover-logic";

const R_HQ = Red.HQ;
const B_HQ = Blue.HQ;

describe.only("gameover", () => {
  it("not gameover when hq is on board", () => {
    const board: GHQState["board"] = [
      [R_HQ, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, B_HQ],
    ];
    expect(getGameoverState(board)).toBeUndefined();
  });
  it("is gameover when an hq is missing", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, B_HQ],
    ];
    expect(getGameoverState(board)).toEqual({ status: "WIN", winner: "BLUE" });
  });
});
