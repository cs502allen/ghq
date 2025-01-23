import { describe, expect, it } from "@jest/globals";
import { GHQState } from "@/game/engine";
import { Blue, Red } from "@/game/tests/test-boards";
import {
  captureCandidates,
  captureCandidatesV2,
  freeInfantryCaptures,
} from "@/game/capture-logic";

const BINF = Blue.INFANTRY;
const BAIR = Blue.AIRBORNE;
const RAIR = Red.AIRBORNE;
const BARM = Blue.ARMORED_INF;
const BART = Blue.ARTILLERY(180);
const BAR2 = Blue.ARTILLERY(90);
const BAR3 = Blue.ARTILLERY(270);
const BAR4 = Blue.ARTILLERY(0);
const RINF = Red.INFANTRY;
const RART = Red.ARTILLERY(0);
const R_HQ = Red.HQ;
const B_HQ = Blue.HQ;

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
  it("paratrooper can capture", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BAIR, null, null, null, null, null, null],
      [null, RINF, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(captureCandidates([2, 1], board)).toEqual([[3, 1]]);
  });
  it("armored infantry can capture", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BARM, null, null, null, null, null, null],
      [null, RINF, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(captureCandidates([2, 1], board)).toEqual([[3, 1]]);
  });
  it("can capture hq with 2 attackers", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BARM, null, null, null, null, null, null],
      [null, R_HQ, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(captureCandidates([2, 1], board)).toEqual([[3, 1]]);
  });
  it("can't capture hq with 1 attacker", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BINF, null, null, null, null, null, null],
      [null, R_HQ, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(captureCandidates([2, 1], board)).toEqual([]);
  });
  it("can capture artillery while next to an hq, which doesn't defend", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, RART, null],
      [null, null, null, null, null, null, BAIR, R_HQ],
    ];
    expect(captureCandidates([7, 6], board)).toEqual([[6, 6]]);
  });
  it("weird edge case", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BINF, BINF],
      [null, null, null, null, null, null, null, RAIR],
      [null, null, null, null, null, null, null, B_HQ],
    ];
    expect(captureCandidates([5, 7], board)).toEqual([]);
  });
  it("hq and infantry shouldn't be able to capture", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BINF, null],
      [null, null, null, null, null, null, RINF, B_HQ],
    ];
    expect(captureCandidates([7, 7], board)).toEqual([]);
  });
  it("hq isn't capturable by artillery and infantry", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, RART],
      [null, null, null, null, null, null, RINF, B_HQ],
    ];
    expect(captureCandidates([7, 6], board)).toEqual([]);
  });
  it("capture scenario from issue #58 should be supported", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [RINF, BAIR, null, null, null, null, null, null],
      [null, RINF, BARM, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(captureCandidates([1, 0], board)).toEqual([]);
  });
});

describe("computing allowed captures v2", () => {
  it("doesnt allow capturing defended pieces", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BINF, null, null, null, null, null, null],
      [null, null, BART, null, null, null, null, null],
      [null, RINF, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [4, 1],
        attackerTo: [3, 1],
        board,
      })
    ).toEqual([]);
  });
  it("doesnt allow capturing defended pieces 3", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BINF, null, null, null, null, null, null],
      [BART, null, BART, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, RAIR, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RAIR,
        attackerFrom: [7, 1],
        attackerTo: [3, 1],
        board,
      })
    ).toEqual([]);
  });
  it("doesn't allow capturing defended pieces 1", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BINF, null, null, null, null, null, null],
      [null, RINF, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, RAIR, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RAIR,
        attackerFrom: [7, 1],
        attackerTo: [2, 2],
        board,
      })
    ).toEqual([]);
  });
  it("allows capturing defended pieces 1", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BINF, null, null, null, null, null, null],
      [null, RINF, BART, null, null, null, null, null],
      [null, null, RINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, RAIR, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RAIR,
        attackerFrom: [7, 1],
        attackerTo: [1, 1],
        board,
      })
    ).toEqual([[2, 1]]);
  });
  it("doesn't allow capturing defended pieces", () => {
    const board: GHQState["board"] = [
      [B_HQ, BART, null, null, null, null, null, null],
      [BINF, BINF, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, RINF, RINF, RINF],
      [null, null, null, null, RAIR, null, RART, R_HQ],
    ];
    expect(
      captureCandidatesV2({
        attacker: RAIR,
        attackerFrom: [7, 4],
        attackerTo: [0, 2],
        board,
      })
    ).toEqual([]);
  });
  it("doesn't allow capturing defended pieces", () => {
    const board: GHQState["board"] = [
      [B_HQ, BART, null, BAIR, null, null, null, null],
      [BINF, BINF, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, RINF, RINF, RINF],
      [null, null, null, null, null, null, RART, R_HQ],
    ];
    expect(
      captureCandidatesV2({
        attacker: BAIR,
        attackerFrom: [0, 3],
        attackerTo: [7, 5],
        board,
      })
    ).toEqual([]);
  });
  it("doesn't allow capturing defended pieces", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, BINF, RINF, null, null, null, null, null],
      [null, RINF, null, RINF, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: BINF,
        attackerFrom: [1, 1],
        attackerTo: [2, 2],
        board,
      })
    ).toEqual([]);
  });
  it("captures one piece when two on cardinal sides", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, BINF, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, RINF, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: BINF,
        attackerFrom: [1, 1],
        attackerTo: [2, 1],
        board,
      })
    ).toEqual([[3, 1]]);
  });
  it("allows capturing two pieces when two on cardinal sides", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, BINF, RINF, null, null, null, null, null],
      [null, RINF, BINF, null, BINF, RINF, null, null],
      [RINF, BINF, null, RINF, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [4, 3],
        attackerTo: [3, 3],
        board,
      })
    ).toEqual(
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
      [RINF, null, RINF, BINF, null, null, null, null],
      [null, BINF, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: BINF,
        attackerFrom: [5, 1],
        attackerTo: [4, 1],
        board,
      })
    ).toEqual([]);
  });
  it("allows capturing artillery", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, RART, null, null, null, null, null],
      [null, RART, null, null, null, null, null, null],
      [null, null, null, BINF, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: BINF,
        attackerFrom: [3, 3],
        attackerTo: [2, 2],
        board,
      })
    ).toEqual(
      expect.arrayContaining([
        [2, 1],
        [1, 2],
      ])
    );
  });
  it("paratrooper can capture", () => {
    const board: GHQState["board"] = [
      [null, BAIR, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, RINF, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: BAIR,
        attackerFrom: [0, 1],
        attackerTo: [2, 1],
        board,
      })
    ).toEqual([[3, 1]]);
  });
  it("armored infantry can capture", () => {
    const board: GHQState["board"] = [
      [null, BARM, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, RINF, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: BARM,
        attackerFrom: [0, 1],
        attackerTo: [2, 1],
        board,
      })
    ).toEqual([[3, 1]]);
  });
  it("can capture hq with 2 attackers", () => {
    const board: GHQState["board"] = [
      [null, BARM, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, R_HQ, BINF, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: BARM,
        attackerFrom: [0, 1],
        attackerTo: [2, 1],
        board,
      })
    ).toEqual([[3, 1]]);
  });
  it("can't capture hq with 1 attacker", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, BINF, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, R_HQ, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: BINF,
        attackerFrom: [1, 1],
        attackerTo: [2, 1],
        board,
      })
    ).toEqual([]);
  });
  it("can capture artillery while next to an hq, which doesn't defend", () => {
    const board: GHQState["board"] = [
      [BAIR, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, RART, null],
      [null, null, null, null, null, null, null, R_HQ],
    ];
    expect(
      captureCandidatesV2({
        attacker: BAIR,
        attackerFrom: [0, 0],
        attackerTo: [6, 7],
        board,
      })
    ).toEqual([[6, 6]]);
  });
  it("weird edge case", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, BINF],
      [null, null, null, null, null, null, BINF, null],
      [null, null, null, null, null, null, null, RAIR],
      [null, null, null, null, null, null, null, B_HQ],
    ];
    expect(
      captureCandidatesV2({
        attacker: BINF,
        attackerFrom: [4, 7],
        attackerTo: [5, 7],
        board,
      })
    ).toEqual([]);
  });
  it("hq and infantry shouldn't be able to capture", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BINF, B_HQ],
      [null, null, null, null, null, null, RINF, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: B_HQ,
        attackerFrom: [6, 7],
        attackerTo: [7, 7],
        board,
      })
    ).toEqual([]);
  });
  it("hq isn't capturable by artillery and infantry", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, RART],
      [null, null, null, null, null, RINF, null, B_HQ],
    ];
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [7, 5],
        attackerTo: [7, 6],
        board,
      })
    ).toEqual([]);
  });
  it("capture scenario from issue #58 should be supported", () => {
    const board: GHQState["board"] = [
      [RINF, null, null, null, null, null, null, null],
      [null, BAIR, null, null, null, null, null, null],
      [null, RINF, BARM, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [0, 0],
        attackerTo: [1, 0],
        board,
      })
    ).toEqual([]);
  });
  it("allows capturing while standing behind a horizontal artillery 1 (issue #115)", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, BAR3, null, null, null],
      [null, null, null, null, RINF, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [5, 4],
        attackerTo: [4, 5],
        board,
      })
    ).toEqual([[4, 4]]);
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [5, 4],
        attackerTo: [4, 3],
        board,
      })
    ).toEqual([]);
  });
  it("allows capturing while standing behind a horizontal artillery 2 (issue #115)", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, BAR2, null, null, null],
      [null, null, null, null, RINF, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [5, 4],
        attackerTo: [4, 5],
        board,
      })
    ).toEqual([]);
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [5, 4],
        attackerTo: [4, 3],
        board,
      })
    ).toEqual([[4, 4]]);
  });
  it("allows capturing while standing behind a horizontal artillery 3 (issue #115)", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, RINF, BAR4, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [4, 3],
        attackerTo: [3, 4],
        board,
      })
    ).toEqual([]);
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [4, 3],
        attackerTo: [5, 4],
        board,
      })
    ).toEqual([[4, 4]]);
  });
  it("allows capturing while standing behind a horizontal artillery 4 (issue #115)", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, RINF, BART, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [4, 3],
        attackerTo: [3, 4],
        board,
      })
    ).toEqual([[4, 4]]);
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [4, 3],
        attackerTo: [5, 4],
        board,
      })
    ).toEqual([]);
  });
  it("doesn't allow capturing hq when moving an adjacent infantry (issue #138)", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, RINF, B_HQ, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: RINF,
        attackerFrom: [4, 3],
        attackerTo: [5, 4],
        board,
      })
    ).toEqual([]);
  });
  it("allows weird paratrooper capture scenario (issue #173)", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, BINF, null, null],
      [null, null, null, null, null, null, RART, BINF],
      [null, null, null, null, null, RINF, BINF, RINF],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(
      captureCandidatesV2({
        attacker: BINF,
        attackerFrom: [2, 5],
        attackerTo: [3, 5],
        board,
      })
    ).toEqual([
      [4, 5],
      [3, 6],
    ]);
  });
});

describe("clear free captures", () => {
  it("doesn't allow any free captures when engagement is equal", () => {
    const board: GHQState["board"] = [
      [RINF, BINF, null, null, null, null, null, null],
      [null, RINF, null, null, null, BINF, null, null],
      [null, BINF, null, null, null, RINF, null, null],
      [null, null, null, null, RINF, BINF, null, null],
      [null, null, null, RINF, BINF, RINF, BINF, null],
      [null, null, null, BINF, RINF, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, RINF],
    ];
    expect(freeInfantryCaptures(board, "RED")).toEqual([]);
  });
  it("allows free captures on engaged attackers", () => {
    const board: GHQState["board"] = [
      [RINF, BINF, null, null, null, null, null, null],
      [null, RINF, BINF, null, null, BINF, null, null],
      [null, BINF, null, null, BINF, RINF, null, null],
      [null, null, null, null, RINF, BINF, null, null],
      [null, null, null, RINF, BINF, RINF, BINF, null],
      [null, null, null, BINF, RINF, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, RINF],
    ];

    expect(freeInfantryCaptures(board, "BLUE")).toEqual(
      expect.arrayContaining([
        {
          attacker: {
            piece: BINF,
            coordinate: [1, 2],
          },
          capture: {
            piece: RINF,
            coordinate: [1, 1],
          },
        },
        {
          attacker: {
            piece: BINF,
            coordinate: [4, 6],
          },
          capture: {
            piece: RINF,
            coordinate: [4, 5],
          },
        },
      ])
    );
  });
  it("allows capturing a smothered hq", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, BINF],
      [null, null, null, null, null, null, BINF, R_HQ],
    ];

    // Making a note of the current behavior (two pieces attacking the HQ), even if it's weird
    expect(freeInfantryCaptures(board, "BLUE")).toEqual(
      expect.arrayContaining([
        {
          attacker: {
            piece: BINF,
            coordinate: [7, 6],
          },
          capture: {
            piece: R_HQ,
            coordinate: [7, 7],
          },
        },
        {
          attacker: {
            piece: BINF,
            coordinate: [6, 7],
          },
          capture: {
            piece: R_HQ,
            coordinate: [7, 7],
          },
        },
      ])
    );
  });
  it("doesn't allow capturing a smothered hq on the opponent's turn", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, BINF],
      [null, null, null, null, null, null, BINF, R_HQ],
    ];
    expect(freeInfantryCaptures(board, "RED")).toEqual([]);
  });
  it("doesn't allow capturing while standing in front of an artillery 1", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BART, null],
      [null, null, null, null, null, null, RINF, null],
    ];
    expect(freeInfantryCaptures(board, "RED")).toEqual([]);
  });
  it("doesn't allow capturing while standing in front of an artillery 2", () => {
    const board: GHQState["board"] = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, BINF, null, null, null],
      [null, null, null, null, RART, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    expect(freeInfantryCaptures(board, "BLUE")).toEqual([]);
  });
});
