import { UnitType } from "@/game/engine";

export interface PieceInfo {
  name: string;
  image: string;
  moveNum: number;
  moves: string;
  captures?: string;
  bombards?: string;
  bombardNum?: number;
  capturedBy: string;
  special?: string;
  rotates?: boolean;
  isHq?: boolean;
  isAirborne?: boolean;
}

export const PIECE_INFO: Record<UnitType, PieceInfo> = {
  INFANTRY: {
    name: "Infantry",
    image: "regular-infantry",
    moves: "1 square, any direction",
    moveNum: 1,
    captures: "1 square, adjacent",
    capturedBy: "2 adjacent infantry",
  },
  ARMORED_INFANTRY: {
    name: "Armored Infantry",
    image: "armored-infantry",
    moves: "2 squares, any direction",
    moveNum: 2,
    captures: "1 square, adjacent",
    capturedBy: "2 adjacent infantry",
  },
  AIRBORNE_INFANTRY: {
    name: "Airborne Infantry",
    image: "paratrooper-infantry",
    moves: "1 square, any direction",
    moveNum: 1,
    captures: "1 square, adjacent",
    capturedBy: "2 adjacent infantry",
    special: "While on home row, it can move to any square!",
    isAirborne: true,
  },
  ARTILLERY: {
    name: "Artillery",
    image: "regular-artillery",
    moves: "1 square, any direction",
    moveNum: 1,
    bombards: "2 squares, forward",
    bombardNum: 2,
    capturedBy: "1 adjacent infantry",
    special: "Rotates any direction",
    rotates: true,
  },
  ARMORED_ARTILLERY: {
    name: "Armored Artillery",
    image: "armored-artillery",
    moves: "2 squares, any direction",
    moveNum: 2,
    bombards: "2 squares, forward",
    bombardNum: 2,
    capturedBy: "1 adjacent infantry",
    special: "Rotates any direction",
    rotates: true,
  },
  HEAVY_ARTILLERY: {
    name: "Heavy Artillery",
    image: "heavy-artillery",
    moves: "1 square, any direction",
    moveNum: 1,
    bombards: "3 squares, forward",
    bombardNum: 3,
    capturedBy: "1 adjacent infantry",
    special: "Rotates any direction",
    rotates: true,
  },
  HQ: {
    name: "HQ",
    image: "hq",
    moves: "1 square, any direction",
    moveNum: 1,
    capturedBy: "2 adjacent infantry",
    special: "Can't defend, can't attack.",
    isHq: true,
  },
};
