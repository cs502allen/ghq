import { GHQState, Orientation, Player, Square } from "@/game/engine";

const shorthands = (player: Player) => {
  return {
    HQ: { type: "HQ", player: player } as Square,
    AIRBORNE: { type: "AIRBORNE_INFANTRY", player: player } as Square,
    INFANTRY: { type: "INFANTRY", player: player } as Square,
    ARMORED_INF: { type: "ARMORED_INFANTRY", player: player } as Square,
    ARTILLERY: (orientation: Orientation) =>
      ({ type: "ARTILLERY", player: player, orientation } as Square),
  };
};

export const Blue = shorthands("BLUE");
export const Red = shorthands("RED");

export const initialBoardSetup: GHQState["board"] = [
  [Blue.HQ, Blue.ARTILLERY(180), null, null, null, null, null, null],
  [Blue.INFANTRY, Blue.INFANTRY, Blue.INFANTRY, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, Red.INFANTRY, Red.INFANTRY, Red.INFANTRY],
  [null, null, null, null, null, null, Red.ARTILLERY(0), Red.HQ],
];

export const initialBoardSetupWithAnArmored: GHQState["board"] = [
  [
    Blue.HQ,
    Blue.ARTILLERY(180),
    null,
    null,
    null,
    null,
    null,
    { type: "ARMORED_INFANTRY", player: "BLUE", orientation: 180 },
  ],
  [Blue.INFANTRY, Blue.INFANTRY, Blue.INFANTRY, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, Red.INFANTRY, Red.INFANTRY, Red.INFANTRY],
  [null, null, null, null, null, null, Red.ARTILLERY(0), Red.HQ],
];

export const initialBoardSetupWithAnAirborneBack: GHQState["board"] = [
  [Blue.HQ, Blue.ARTILLERY(180), null, null, null, null, null, Blue.AIRBORNE],
  [Blue.INFANTRY, Blue.INFANTRY, Blue.INFANTRY, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, Red.INFANTRY, Red.INFANTRY, Red.INFANTRY],
  [null, null, null, null, null, null, Red.ARTILLERY(0), Red.HQ],
];

export const initialBoardSetupWithAnAirborneEnemyBack: GHQState["board"] = [
  [Blue.HQ, Blue.ARTILLERY(180), null, null, null, null, null, null],
  [Blue.INFANTRY, Blue.INFANTRY, Blue.INFANTRY, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, Red.INFANTRY, Red.INFANTRY, Red.INFANTRY],
  [Blue.AIRBORNE, null, null, null, null, null, Red.ARTILLERY(0), Red.HQ],
];

export const initialBoardSetupWithAnAirborneNotBack: GHQState["board"] = [
  [Blue.HQ, Blue.ARTILLERY(180), null, null, null, null, null, null],
  [
    Blue.INFANTRY,
    Blue.INFANTRY,
    Blue.INFANTRY,
    Blue.AIRBORNE,
    null,
    null,
    null,
    null,
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, Red.INFANTRY, Red.INFANTRY, Red.INFANTRY],
  [null, null, null, null, null, null, Red.ARTILLERY(0), Red.HQ],
];

export const artillaryFaceOff: GHQState["board"] = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, Red.ARTILLERY(90), null, Blue.ARTILLERY(270), null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
];
