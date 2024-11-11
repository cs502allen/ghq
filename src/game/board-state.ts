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
import { captureCandidates } from "@/game/capture-logic";

/*
// @todo there's a dead state when you click into a piece you can't move. No way out. Should add guard for allowed pieces > 1 and transition to ready state if failed
 */

export const turnStateMachine = createMachine({
  initial: "ready",
  id: "turn-machine",
  context: {
    disabledPieces: [],
    player: "RED",
    // selectedPiece
  },
  types: {} as {
    context: {
      disabledPieces: Coordinate[];
      player: Player;

      // move active piece
      selectedPiece?: { at: Coordinate; piece: NonNullSquare };
      allowedMoves?: Coordinate[];
      stagedMove?: Coordinate;
      allowedCaptures?: Coordinate[];
      captureEnemyAt?: Coordinate;
      // reinforce
      unitKind?: keyof ReserveFleet;
    };
    events:
      | { type: "START_TURN"; player: Player; disabledPieces: Coordinate[] }
      | { type: "NOT_TURN" }
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
        disabledPieces: event.disabledPieces,
        player: event.player,
      })),
      target: ".replay",
    },
    NOT_TURN: {
      target: ".notTurn",
    },
    DESELECT: {
      target: ".ready",
    },
  },
  states: {
    notTurn: {},
    replay: {
      after: {
        1000: "ready", // Transitions to the 'ready' state after 1000 milliseconds (1 second)
      },
    },
    ready: {
      entry: assign({
        selectedPiece: undefined,
        allowedMoves: undefined,
        unitKind: undefined,
        captureEnemyAt: undefined,
        stagedMove: undefined,
        allowedCaptures: undefined,
      }),
      on: {
        SELECT_RESERVE_PIECE: {
          // has a reserve here
          guard: ({ context, event }) => {
            const spawnPosition = spawnPositionsForPlayer(
              event.currentBoard,
              context.player
            );

            return event.reserve[event.kind] > 0 && spawnPosition.length > 0;
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
      initial: "selectSquare",
      states: {
        selectSquare: {
          on: {
            SELECT_SQUARE: [
              {
                guard: ({ context, event }) => {
                  const isArtillery =
                    typeof Units[context.selectedPiece!.piece.type]
                      .artilleryRange !== "undefined";

                  return (
                    !isArtillery &&
                    !!context.allowedMoves?.some(
                      (placement) =>
                        placement[0] === event.at[0] &&
                        placement[1] === event.at[1]
                    )
                  );
                },
                actions: [
                  assign({
                    allowedCaptures: ({ event, context }) => {
                      return getStagedInfantryCaptures(
                        context.selectedPiece!.at,
                        event.at,
                        event.currentBoard
                      );
                    },
                    stagedMove: ({ event }) => event.at,
                  }),
                ],
                target: "#turn-machine.selectEnemyToCapture",
              },
              {
                // for artillery
                guard: ({ context, event }) => {
                  const isArtillery =
                    typeof Units[context.selectedPiece!.piece.type]
                      .artilleryRange !== "undefined";

                  return (
                    isArtillery &&
                    !!context.allowedMoves?.some(
                      (placement) =>
                        placement[0] === event.at[0] &&
                        placement[1] === event.at[1]
                    )
                  );
                },
                actions: [
                  assign(({ event, context }) => ({
                    stagedMove: event.at,
                  })),
                ],

                target: "selectOrientation",
              },
            ],
          },
        },
        selectOrientation: {
          on: {
            CHANGE_ORIENTATION: {
              guard: ({ context, event }) => {
                // is artillery
                return (
                  typeof Units[context.selectedPiece!.piece.type]
                    .artilleryRange !== "undefined"
                );
              },
              actions: [
                "moveAndOrient",
                assign(({ event, context }) => ({
                  disabledPieces: [
                    ...context.disabledPieces,
                    context.stagedMove!,
                  ],
                })),
              ],
              target: "#turn-machine.ready",
            },
          },
        },
      },
      on: {
        // change the piece we're selecting
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
    selectEnemyToCapture: {
      always: [
        {
          guard: ({ context, event }) => {
            const isArtillery =
              typeof Units[context.selectedPiece!.piece.type].artilleryRange !==
              "undefined";

            return !isArtillery && (context.allowedCaptures || []).length <= 1;
          },
          actions: [
            assign(({ event, context }) => ({
              captureEnemyAt: (context.allowedCaptures || [])[0],
              disabledPieces: [...context.disabledPieces, context.stagedMove!],
            })),
            "movePiece",
          ],
          target: "#turn-machine.ready",
        },
      ],
      on: {
        SELECT_SQUARE: {
          guard: ({ context, event }) => {
            return (context.allowedCaptures || []).some(([x, y]) => {
              return event.at[0] === x && event.at[1] === y;
            });
          },
          actions: [
            assign(({ event, context }) => ({
              captureEnemyAt: event.at,
              disabledPieces: [...context.disabledPieces, context.stagedMove!],
            })),
            "movePiece",
          ],
          target: "#turn-machine.ready",
        },
      },
    },
    //move types
    reservePieceSelected: {
      on: {
        SELECT_RESERVE_PIECE: {
          // has a reserve here
          guard: ({ context, event }) => {
            const spawnPosition = spawnPositionsForPlayer(
              event.currentBoard,
              context.player
            );

            return event.reserve[event.kind] > 0 && spawnPosition.length > 0;
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

function getStagedInfantryCaptures(
  from: Coordinate,
  to: Coordinate,
  lastBoard: GHQState["board"]
) {
  const clone: GHQState["board"] = JSON.parse(JSON.stringify(lastBoard));

  const piece = clone[from[0]][from[1]];
  clone[from[0]][from[1]] = null;
  clone[to[0]][to[1]] = piece;

  return captureCandidates(to, clone);
}
