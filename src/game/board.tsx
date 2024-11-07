import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  GHQState,
  NonNullSquare,
  Orientation,
  Player,
  ReserveFleet,
  Units,
} from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
import { useMachine } from "@xstate/react";
import { turnStateMachine } from "@/game/board-state";
import classNames from "classnames";
import { useHotkeys } from "react-hotkeys-hook";
import { bombardedSquares } from "@/game/move-logic";
import { SelectOrientation } from "@/game/select-orientation";
import CountdownTimer from "@/game/countdown";
import { Check, Flag, MoveRight, Percent, Undo } from "lucide-react";
import { colIndexToFile, rowIndexToRank } from "./notation";
import { PlayOnlineButton } from "@/app/live/PlayOnlineButton";
import { SoundPlayer } from "./SoundPlayer";
import { HistoryLog } from "./HistoryLog";

const rows = 8;
const columns = 8;
//coordinate string x,y
type Annotations = {
  [key: string]: {
    moveTo?: true;
    bombardedBy?: { RED?: true; BLUE?: true };
    selectedPiece?: true;
    showAim?: true;
    showTarget?: true;
    hidePiece?: true;
    showProxyPiece?: NonNullSquare;
  };
};

export function GHQBoard({
  ctx,
  G,
  moves,
  playerID,
  undo,
  redo,
  plugins,
  log,
}: BoardProps<GHQState>) {
  const divRef = useRef(null); // Create a ref

  const isPrimaryPlayer = useCallback(
    (playerId: string) => {
      // If playerID is null, it means we're in spectator mode.
      // TODO(tyler): ensure they can't click moves on local (master will prevent it anyway)
      if (playerID === null) {
        playerID = "0";
      }

      if (G.isOnline) {
        return playerId === playerID;
      }

      return ctx.currentPlayer === playerId;
    },
    [G.isOnline, playerID, ctx.currentPlayer]
  );

  const [state, send] = useMachine(
    turnStateMachine.provide({
      actions: {
        movePiece: ({ context, event }) => {
          moves.Move(
            context.selectedPiece!.at,
            context.stagedMove!,
            context.captureEnemyAt
          );
        },
        changeOrientation: ({ context, event }) => {
          if ("orientation" in event)
            moves.ChangeOrientation(
              context.selectedPiece!.at,
              event.orientation
            );
        },
        spawnPiece: ({ context, event }) => {
          if (context.unitKind && "at" in event)
            moves.Reinforce(context.unitKind, event.at);
        },
        moveAndOrient: ({ context, event }) => {
          if ("orientation" in event) {
            moves.MoveAndOrient(
              context.selectedPiece!.at,
              context.stagedMove,
              event.orientation
            );
          }
        },
      },
    })
  );

  useHotkeys("escape", () => send({ type: "DESELECT" }), [send]);
  useHotkeys("left", () => undo(), [undo]);
  useHotkeys("right", () => redo(), [redo]);

  useEffect(() => {
    send({
      type: "START_TURN",
      player: isPrimaryPlayer("0") ? "RED" : "BLUE",
    });
  }, [isPrimaryPlayer]);

  const selectReserve = useCallback(
    (kind: keyof ReserveFleet) => {
      send({
        type: "SELECT_RESERVE_PIECE",
        currentBoard: G.board,
        reserve: isPrimaryPlayer("0") ? G.redReserve : G.blueReserve,
        kind,
      });
    },
    [G.board, G.redReserve, G.blueReserve, isPrimaryPlayer]
  );

  const annotations = useMemo(() => {
    const annotate: Annotations = {};

    (state.context.allowedMoves || []).forEach((i) => {
      annotate[`${i[0]},${i[1]}`] = annotate[`${i[0]},${i[1]}`]
        ? { ...annotate[`${i[0]},${i[1]}`], moveTo: true }
        : { moveTo: true };
    });

    const bombarded = bombardedSquares(G.board);
    Object.entries(bombarded).forEach(([key, value]) => {
      if (annotate[key]) {
        annotate[key].bombardedBy = value;
      } else {
        annotate[key] = { bombardedBy: value };
      }
    });

    const { selectedPiece } = state.context;
    if (selectedPiece) {
      annotate[`${selectedPiece.at[0]},${selectedPiece.at[1]}`] = {
        ...annotate[`${selectedPiece.at[0]},${selectedPiece.at[1]}`],
        selectedPiece: true,
      };
    }

    const aiming = state.matches("activePieceSelected.selectOrientation");
    if (aiming && state.context.stagedMove) {
      const [x, y] = state.context.stagedMove;
      annotate[`${x},${y}`] = { ...annotate[`${x},${y}`], showAim: true };

      const [oldX, oldY] = state.context.selectedPiece!.at;
      annotate[`${oldX},${oldY}`] = {
        ...annotate[`${oldX},${oldY}`],
        hidePiece: true,
      };
    }

    if (
      state.matches("selectEnemyToCapture") &&
      state.context.stagedMove &&
      (state.context.allowedCaptures || []).length > 1
    ) {
      const captures = state.context.allowedCaptures!;

      captures.forEach(([xx, yy]) => {
        annotate[`${xx},${yy}`] = {
          ...annotate[`${xx},${yy}`],
          showTarget: true,
        };
      });

      const [oldX, oldY] = state.context.selectedPiece!.at;

      annotate[`${oldX},${oldY}`] = {
        ...annotate[`${oldX},${oldY}`],
        hidePiece: true,
      };

      const [x, y] = state.context.stagedMove!;

      annotate[`${x},${y}`] = {
        ...annotate[`${x},${y}`],
        showProxyPiece: state.context.selectedPiece!.piece,
      };
    }

    return annotate;
  }, [state.context, G.board]);

  const lastTurnMoves = new Set<string>();
  for (const [key, value] of Object.entries(G.lastTurnMoves ?? {})) {
    for (const move of value) {
      lastTurnMoves.add(`${move[0]},${move[1]}`);
    }
  }

  const cells = Array.from({ length: rows }).map((_, rowIndex) => {
    const colN = Array.from({ length: columns }, (_, index) => index);
    const cols = isPrimaryPlayer("0") ? colN : colN.reverse();
    return (
      <tr key={rowIndex}>
        {cols.map((colIndex) => {
          const square = G.board[rowIndex][colIndex];

          const annotationsForSquare = annotations[`${rowIndex},${colIndex}`];

          const showTarget = annotationsForSquare?.showTarget;

          const add180 =
            square &&
            ((isPrimaryPlayer("0") && square.player === "BLUE") ||
              (isPrimaryPlayer("1") && square.player === "RED"));

          const bombardmentClass =
            annotationsForSquare && annotationsForSquare.bombardedBy
              ? annotationsForSquare.bombardedBy
                ? annotationsForSquare.bombardedBy.BLUE &&
                  annotationsForSquare.bombardedBy.RED
                  ? "stripe-red-blue"
                  : annotationsForSquare.bombardedBy.BLUE
                  ? "stripe-blue-transparent"
                  : annotationsForSquare.bombardedBy.RED
                  ? "stripe-red-transparent"
                  : ""
                : ""
              : "";

          const selectingOrientation = Boolean(
            square &&
              Units[square.type].artilleryRange &&
              annotationsForSquare?.selectedPiece
          );

          const aiming = Boolean(
            annotations[`${rowIndex},${colIndex}`]?.showAim
          );
          const hidePiece = Boolean(
            annotations[`${rowIndex},${colIndex}`]?.hidePiece
          );

          return (
            <td
              onClick={() => {
                if (state.matches("selectEnemyToCapture") || !square) {
                  send({
                    type: "SELECT_SQUARE",
                    at: [rowIndex, colIndex],
                    currentBoard: G.board,
                  });
                } else {
                  send({
                    type: "SELECT_ACTIVE_PIECE",
                    at: [rowIndex, colIndex],
                    piece: square,
                    currentBoard: G.board,
                  });
                }
              }}
              key={colIndex}
              className={classNames(
                "relative",
                bombardmentClass,
                {
                  ["cursor-pointer"]:
                    annotationsForSquare?.moveTo ||
                    square?.player === (isPrimaryPlayer("0") ? "RED" : "BLUE"),
                },
                { ["bg-red-900"]: showTarget },
                (rowIndex + colIndex) % 2 === 0 ? "bg-gray-300" : "bg-gray-200"
              )}
              style={{
                boxShadow:
                  (annotationsForSquare?.selectedPiece && !hidePiece) || aiming
                    ? "inset 0 0 8px darkgray"
                    : "",
                textAlign: "center",
                width: "90px",
                height: "90px",
              }}
            >
              {lastTurnMoves.has(`${rowIndex},${colIndex}`) ? (
                <div
                  className="absolute w-full h-full bg-yellow-300 top-0"
                  style={{ pointerEvents: "none", opacity: 0.3 }}
                ></div>
              ) : null}
              <BoardCoordinateLabels
                isPrimaryPlayer={isPrimaryPlayer}
                colIndex={colIndex}
                rowIndex={rowIndex}
              />
              {square && !selectingOrientation && !hidePiece ? (
                <div
                  className={classNames(
                    "flex items-center justify-center select-none font-bold text-3xl",
                    square.player === "RED" ? "text-red-600" : "text-blue-600",
                    {
                      // @todo this is really only for infantry. Adjust when we do orientation
                      // ["rotate-180"]:
                      //   (isPrimaryPlayer("0") && square.player === "BLUE") ||
                      //   (isPrimaryPlayer("1") && square.player === "RED"),
                    }
                  )}
                >
                  <img
                    src={`/${
                      Units[square.type].imagePathPrefix
                    }-${square.player.toLowerCase()}.png`}
                    width="52"
                    height="52"
                    className={classNames("select-none", {
                      ["opacity-50"]:
                        (ctx.currentPlayer === "0" &&
                          square.player === "BLUE") ||
                        (ctx.currentPlayer === "1" && square.player === "RED"),
                    })}
                    draggable="false"
                    style={{
                      transform: square.orientation
                        ? isPrimaryPlayer("1")
                          ? `rotate(${square.orientation - 180}deg)`
                          : `rotate(${square.orientation}deg)`
                        : `rotate(${add180 ? 180 : 0}deg)`,
                    }}
                    alt={Units[square.type].imagePathPrefix}
                  />
                </div>
              ) : null}

              {annotationsForSquare?.showProxyPiece ? (
                <div
                  className={classNames(
                    "flex items-center justify-center select-none font-bold text-3xl",
                    annotationsForSquare?.showProxyPiece.player === "RED"
                      ? "text-red-600"
                      : "text-blue-600",
                    {
                      // @todo this is really only for infantry. Adjust when we do orientation
                      // ["rotate-180"]:
                      //   (isPrimaryPlayer("0") && square.player === "BLUE") ||
                      //   (isPrimaryPlayer("1") && square.player === "RED"),
                    }
                  )}
                >
                  <img
                    src={`/${
                      Units[annotationsForSquare?.showProxyPiece.type]
                        .imagePathPrefix
                    }-${annotationsForSquare?.showProxyPiece.player.toLowerCase()}.png`}
                    width="35"
                    height="35"
                    className="select-none"
                    draggable="false"
                    style={{
                      transform: annotationsForSquare?.showProxyPiece
                        .orientation
                        ? isPrimaryPlayer("1")
                          ? `rotate(${
                              180 -
                              annotationsForSquare?.showProxyPiece.orientation
                            }deg)`
                          : `rotate(${annotationsForSquare?.showProxyPiece.orientation}deg)`
                        : `rotate(${add180 ? 180 : 0}deg)`,
                    }}
                    alt={
                      Units[annotationsForSquare?.showProxyPiece.type]
                        .imagePathPrefix
                    }
                  />
                </div>
              ) : null}

              {square && selectingOrientation && !hidePiece ? (
                <SelectOrientation
                  initialOrientation={square.orientation!}
                  player={square.player}
                  onChange={(orientation: Orientation) => {
                    send({
                      type: "CHANGE_ORIENTATION",
                      orientation: orientation,
                    });
                  }}
                >
                  <img
                    src={`/${
                      Units[square.type].imagePathPrefix
                    }-${square.player.toLowerCase()}.png`}
                    width="35"
                    height="35"
                    className="select-none"
                    draggable="false"
                    style={{
                      transform: square.orientation
                        ? isPrimaryPlayer("1")
                          ? `rotate(${180 - square.orientation}deg)`
                          : `rotate(${square.orientation}deg)`
                        : `rotate(${add180 ? 180 : 0}deg)`,
                    }}
                    alt={Units[square.type].imagePathPrefix}
                  />
                </SelectOrientation>
              ) : null}
              {annotationsForSquare?.moveTo &&
              !aiming &&
              !state.matches("selectEnemyToCapture") ? (
                <div className="rounded-full w-6 h-6 m-auto bg-green-600/40" />
              ) : null}
              {showTarget ? <div className="target-square "></div> : null}
              {aiming && state.context.selectedPiece ? (
                <SelectOrientation
                  initialOrientation={
                    state.context.selectedPiece!.piece!.orientation!
                  }
                  player={state.context.player}
                  onChange={(orientation: Orientation) => {
                    send({
                      type: "CHANGE_ORIENTATION",
                      orientation: orientation,
                    });
                  }}
                >
                  <img
                    src={`/${
                      Units[state.context.selectedPiece.piece.type]
                        .imagePathPrefix
                    }-${state.context.player.toLowerCase()}.png`}
                    width="35"
                    height="35"
                    className="select-none"
                    draggable="false"
                    style={{
                      transform: state.context.selectedPiece.piece.orientation
                        ? isPrimaryPlayer("1")
                          ? `rotate(${
                              180 -
                              state.context.selectedPiece.piece.orientation
                            }deg)`
                          : `rotate(${state.context.selectedPiece.piece.orientation}deg)`
                        : `rotate(${add180 ? 180 : 0}deg)`,
                    }}
                    alt={
                      Units[state.context.selectedPiece.piece.type]
                        .imagePathPrefix
                    }
                  />
                </SelectOrientation>
              ) : null}
            </td>
          );
        })}
      </tr>
    );
  });

  return (
    <div className="grid bg-gray-100 absolute w-full h-full grid-cols-7">
      <SoundPlayer ctx={ctx} G={G} />
      <div className="col-span-5 border-r-2 border-gray-100 flex items-center justify-center">
        <table ref={divRef} style={{ borderCollapse: "collapse" }}>
          {/*flip board*/}
          <tbody>{isPrimaryPlayer("0") ? cells : cells.reverse()}</tbody>
        </table>
      </div>

      <div
        className={classNames(
          "col-span-2  bg-white flex flex-col justify-between",
          isPrimaryPlayer("0") ? "bg-red-50" : "bg-blue-50"
        )}
      >
        <div
          className={classNames(
            "col-span-2 h-full pt-10 flex flex-col justify-between",
            ctx.currentPlayer === "0" ? "bg-red-50" : "bg-blue-50",
            { ["flex-col-reverse"]: isPrimaryPlayer("1") }
          )}
        >
          <div className="flex flex-col gap-2 p-4 ">
            <div className="text-xl flex gap-1">
              <div className="font-bold">{G.userIds[1]}</div>
              <div>({G.elos?.[1] ?? 0})</div>
            </div>
            <CountdownTimer
              active={ctx.currentPlayer === "1" && !ctx.gameover}
              player="BLUE"
              elapsed={G.blueElapsed}
              startDate={G.turnStartTime}
              totalTimeAllowed={G.timeControl}
            />
            <div className="items-center justify-center flex">
              <ReserveBank
                player="BLUE"
                reserve={G.blueReserve}
                selectedKind={
                  isPrimaryPlayer("1") ? state.context.unitKind : undefined
                }
                selectable={
                  isPrimaryPlayer("1") && !state.matches("activePieceSelected")
                }
                selectReserve={selectReserve}
              />
            </div>
          </div>

          {ctx.gameover ? (
            <div className="flex flex-col items-center justify-center gap-1 justify-center items-center">
              <h2
                className={classNames(
                  "text-center font-semibold text-2xl",
                  ctx.gameover.status === "DRAW" && "text-gray-800",
                  ctx.gameover.status === "WIN" && ctx.gameover.winner === "RED"
                    ? "text-red-500"
                    : "text-blue-500"
                )}
              >
                {ctx.gameover.status === "DRAW" ? (
                  "Draw!"
                ) : (
                  <>{ctx.gameover.winner === "RED" ? "Red " : "Blue"} Won!</>
                )}
              </h2>
              {ctx.gameover.reason && ctx.gameover.reason}
              <PlayOnlineButton />
            </div>
          ) : (
            <div
              className={classNames(
                "text-center font-semibold flex items-center flex-col justify-center text-2xl flex-1",
                ctx.currentPlayer === "0" ? "text-red-500" : "text-blue-500"
              )}
            >
              {ctx.currentPlayer === "0" ? "Red's " : "Blue's"} Turn
              <div className="text-lg text-gray-600 font-mono flex gap-1 justify-center items-center">
                {3 - ctx.numMoves!} remaining move
                {ctx.numMoves !== 2 ? "s" : ""}{" "}
              </div>
              <div className="flex gap-1 justify-center items-center">
                <SkipButton skip={() => moves.Skip()} />
                {G.drawOfferedBy && G.drawOfferedBy !== ctx.currentPlayer ? (
                  <AcceptDrawButton draw={() => moves.AcceptDraw()} />
                ) : (
                  <OfferDrawButton
                    draw={(offer: boolean) => moves.OfferDraw(offer)}
                  />
                )}
                <ResignButton resign={() => moves.Resign()} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 p-4">
            <div className="text-xl flex gap-1">
              <div className="font-bold">{G.userIds[0]}</div>
              <div>({G.elos?.[0] ?? 0})</div>
            </div>
            <CountdownTimer
              active={ctx.currentPlayer === "0" && !ctx.gameover}
              player="RED"
              elapsed={G.redElapsed}
              startDate={G.turnStartTime}
              totalTimeAllowed={G.timeControl}
            />
            <div className="items-center justify-center flex">
              <ReserveBank
                player="RED"
                selectedKind={
                  isPrimaryPlayer("0") ? state.context.unitKind : undefined
                }
                reserve={G.redReserve}
                selectable={
                  isPrimaryPlayer("0") && !state.matches("activePieceSelected")
                }
                selectReserve={selectReserve}
              />
            </div>
          </div>
        </div>

        <HistoryLog systemMessages={plugins.history.data} log={log} />
      </div>
    </div>
  );
}

function ReserveBank(props: {
  player: Player;
  reserve: ReserveFleet;
  selectable: boolean;
  selectedKind?: keyof ReserveFleet;
  selectReserve: (kind: keyof ReserveFleet) => void;
}) {
  const kinds = [
    "INFANTRY",
    "ARMORED_INFANTRY",
    "AIRBORNE_INFANTRY",
    "ARTILLERY",
    "ARMORED_ARTILLERY",
    "HEAVY_ARTILLERY",
  ] as (keyof ReserveFleet)[];

  const reserves = kinds.flatMap((kind) => {
    const count = props.reserve[kind as keyof ReserveFleet];
    if (count === 0) return null;
    return (
      <div
        onClick={() => {
          props.selectReserve(kind);
        }}
        key={kind}
        className={classNames(
          "col-span-1 select-none flex font-bold text-xl p-1 flex-col items-center cursor-pointer ",
          props.player === "RED" ? "text-red-600" : "text-blue-600",
          { ["cursor-pointer"]: props.selectable },
          { ["hover:bg-gray-100 "]: props.selectedKind !== kind },
          { ["bg-gray-200 "]: props.selectedKind === kind }
        )}
      >
        <img
          src={`/${
            Units[kind].imagePathPrefix
          }-${props.player.toLowerCase()}.png`}
          width="30"
          height="30"
          alt={Units[kind].imagePathPrefix}
        />
        <div>{count}</div>
      </div>
    );
  });

  return <div className="grid flex-1 grid-cols-6">{reserves}</div>;
}

function BoardCoordinateLabels({
  isPrimaryPlayer,
  colIndex,
  rowIndex,
}: {
  isPrimaryPlayer: (playerId: string) => boolean;
  colIndex: number;
  rowIndex: number;
}) {
  return (
    <>
      <div className="absolute top-0 left-1 text-sm font-bold text-gray-400">
        {isPrimaryPlayer("0") && colIndex === 0 && rowIndexToRank(rowIndex)}
      </div>
      <div className="absolute bottom-0 left-1 text-sm font-bold text-gray-400">
        {isPrimaryPlayer("0") && rowIndex === 7 && colIndexToFile(colIndex)}
      </div>
      <div className="absolute top-0 left-1 text-sm font-bold text-gray-400">
        {isPrimaryPlayer("1") && colIndex === 7 && rowIndexToRank(rowIndex)}
      </div>
      <div className="absolute bottom-0 left-1 text-sm font-bold text-gray-400">
        {isPrimaryPlayer("1") && rowIndex === 0 && colIndexToFile(colIndex)}
      </div>
    </>
  );
}

function SkipButton({ skip }: { skip: () => void }) {
  return (
    <button
      onClick={skip}
      className="bg-black text-white py-1 px-2 text-sm rounded hover:bg-gray-800 flex gap-1 items-center"
    >
      <MoveRight className="w-4 h-4" />
      Skip
    </button>
  );
}

function ResignButton({ resign }: { resign: () => void }) {
  const [confirm, setConfirm] = React.useState(false);
  if (confirm) {
    return (
      <div className="flex gap-1">
        <button
          onClick={() => setConfirm(false)}
          className="bg-gray-500 text-white py-1.5 px-2 text-sm rounded hover:bg-gray-400 flex gap-1 items-center"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={resign}
          className="bg-red-500 text-white py-1.5 px-2 text-sm rounded hover:bg-red-600 flex gap-1 items-center"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={() => setConfirm(true)}
      className="bg-red-500 text-white py-1 px-2 text-sm rounded hover:bg-red-600 flex gap-1 items-center"
    >
      <Flag className="w-4 h-4" />
      Resign
    </button>
  );
}

function OfferDrawButton({ draw }: { draw: (offer: boolean) => void }) {
  const [offered, setOffered] = React.useState(false);
  return (
    <button
      onClick={() => {
        draw(!offered);
        setOffered(!offered);
      }}
      className={classNames(
        "bg-gray-500 text-white py-1 px-2 text-sm rounded hover:bg-gray-600 flex gap-1 items-center",
        offered ? "bg-gray-300 hover:bg-gray-400" : ""
      )}
    >
      {offered ? <Undo className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
      {offered ? "Cancel" : "Draw"}
    </button>
  );
}

function AcceptDrawButton({ draw }: { draw: () => void }) {
  return (
    <button
      onClick={draw}
      className={classNames(
        "bg-gray-500 text-white py-1 px-2 text-sm rounded hover:bg-gray-600 flex gap-1 items-center"
      )}
    >
      <Check className="w-4 h-4" />
      Accept Draw
    </button>
  );
}
