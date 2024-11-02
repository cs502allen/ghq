import { assign, createMachine } from "xstate";
import {
  Coordinate,
  GHQState,
  NonNullSquare,
  Orientation,
  Player,
  ReserveFleet,
  Units,
} from "@/game/engine";
import {
  movesForActivePiece,
  spawnPositionsForPlayer,
} from "@/game/move-logic";

/*
// @todo there's a dead state when you click into a piece you can't move. No way out. Should add guard for allowed pieces > 1 and transition to ready state if failed
 */

export const turnStateMachine = createMachine({
  initial: "ready",
  id: "turn-machine",
  context: {
    disabledPieces: [],
    moves: 0,
    player: "RED",
    // selectedPiece
  },
  types: {} as {
    context: {
      disabledPieces: Coordinate[];
      moves: number;
      player: Player;

      // move active piece
      selectedPiece?: { at: Coordinate; piece: NonNullSquare };
      allowedMoves?: Coordinate[];
      // reinforce
      unitKind?: keyof ReserveFleet;
    };
    events:
      | { type: "START_TURN"; player: Player }
      | {
          type: "SELECT_ACTIVE_PIECE";
          at: Coordinate;
          piece: NonNullSquare;
          currentBoard: GHQState["board"];
        }
      | {
          type: "SELECT_RESERVE_PIECE";
          kind: keyof ReserveFleet;
          reserve: ReserveFleet;
          currentBoard: GHQState["board"];
        }
      | {
          type: "SELECT_SQUARE";
          at: Coordinate;
          currentBoard: GHQState["board"];
        }
      | {
          type: "CHANGE_ORIENTATION";
          orientation: Orientation;
        }
      | {
          type: "DESELECT";
        };
  },
  on: {
    START_TURN: {
      actions: assign(({ event }) => ({
        disabledPieces: [],
        moves: 0,
        player: event.player,
      })),
      target: ".ready",
    },
    DESELECT: {
      target: ".ready",
    },
  },
  states: {
    ready: {
      entry: assign({
        selectedPiece: undefined,
        allowedMoves: undefined,
        unitKind: undefined,
      }),
      on: {
        SELECT_RESERVE_PIECE: {
          // has a reserve here
          guard: ({ event }) => {
            return event.reserve[event.kind] > 0;
          },
          actions: assign(({ context, event }) => {
            return {
              // selectedPiece: {
              //   piece: event.piece,
              //   at: event.at,
              // },
              unitKind: event.kind,
              allowedMoves: spawnPositionsForPlayer(
                event.currentBoard,
                context.player
              ),
            };
          }),
          target: "reservePieceSelected",
        },
        SELECT_ACTIVE_PIECE: {
          guard: ({ context, event }) => {
            return (
              // can't have been moved before
              !context.disabledPieces?.some(
                (placement) =>
                  placement[0] === event.at[0] && placement[1] === event.at[1]
              ) &&
              // my piece
              event.piece.player === context.player
            );
          },
          actions: assign(({ context, event }) => {
            return {
              selectedPiece: {
                piece: event.piece,
                at: event.at,
              },
              allowedMoves: movesForActivePiece(event.at, event.currentBoard),
            };
          }),
          target: "activePieceSelected",
        },
      },
    },
    activePieceSelected: {
      on: {
        SELECT_ACTIVE_PIECE: {
          actions: assign(({ context, event }) => {
            return {
              selectedPiece: {
                piece: event.piece,
                at: event.at,
              },
              allowedMoves: movesForActivePiece(event.at, event.currentBoard),
            };
          }),
          target: "activePieceSelected",
        },
        CHANGE_ORIENTATION: {
          guard: ({ context, event }) => {
            // is artillery
            return (
              typeof Units[context.selectedPiece!.piece.type].artilleryRange !==
              "undefined"
            );
          },
          actions: [
            "changeOrientation",
            assign(({ event, context }) => ({
              disabledPieces: [
                ...context.disabledPieces,
                context.selectedPiece!.at,
              ],
            })),
          ],
          target: "ready",
        },
        SELECT_SQUARE: {
          guard: ({ context, event }) => {
            return !!context.allowedMoves?.some(
              (placement) =>
                placement[0] === event.at[0] && placement[1] === event.at[1]
            );
          },
          actions: [
            "movePiece",
            assign(({ event, context }) => ({
              disabledPieces: [...context.disabledPieces, event.at],
            })),
          ],

          target: "ready",
        },
      },
    },

    //move types
    reservePieceSelected: {
      on: {
        SELECT_SQUARE: {
          guard: ({ context, event }) => {
            // must be allowed
            return !!context.allowedMoves?.some(
              (placement) =>
                placement[0] === event.at[0] && placement[1] === event.at[1]
            );
          },
          actions: [
            "spawnPiece",
            assign(({ event, context }) => ({
              disabledPieces: [...context.disabledPieces, event.at],
            })),
          ],

          target: "ready",
        },
      },
    },
  },
});
