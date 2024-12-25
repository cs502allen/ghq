import { UnitType } from "@/game/engine";

export type MoveLog =
  | {
      type: "Move";
      player: string;
      unitType: UnitType;
      from: any;
      to: any;
      capturedPiece: any;
      capturedCoordinate: any;
      description: any;
    }
  | {
      type: "Reinforce";
      player: string;
      unitType: UnitType;
      at: any;
      description: any;
    }
  | {
      type: "MoveAndOrient";
      player: string;
      unitType: UnitType;
      from: any;
      to: any;
      orientation: any;
      description: any;
    };
