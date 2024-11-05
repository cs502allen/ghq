import { describe, expect, it } from "@jest/globals";
import { GHQState } from "@/game/engine";
import { Blue, Red } from "@/game/tests/test-boards";
import { captureCandidates } from "@/game/capture-logic";

const BINF = Blue.INFANTRY;
const RINF = Red.INFANTRY;
const RART = Red.ARTILLERY(0);
const R_HQ = Red.HQ;

describe("computing allowed captures", () => {
  it("captures one piece when two on cardinal sides", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BINF, null, null, null, null, null, null],
      [null, RINF, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(captureCandidates([2, 1], board)).toEqual([[3, 1]]);
  });
  it("allows capturing two pieces when two on cardinal sides", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BINF, RINF, null, null, null, null, null],
      [null, RINF, BINF, RINF, BINF, RINF, null, null],
      [RINF, BINF, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(captureCandidates([3, 3], board)).toEqual(
      expect.arrayContaining([
        [3, 4],
        [3, 2],
      ])
    );
  });
  it("it doesn't doesn't allow capturing when the piece is engaged", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BINF, RINF, null, null, null, null, null],
      [null, RINF, BINF, RINF, null, null, null, null],
      [RINF, BINF, RINF, BINF, null, null, null, null],
      [null, null, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(captureCandidates([4, 1], board)).toEqual([]);
  });
  it("allows capturing artillery", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, RART, null, null, null, null, null],
      [null, RART, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(captureCandidates([2, 2], board)).toEqual(
      expect.arrayContaining([
        [2, 1],
        [1, 2],
      ])
    );
  });
});
