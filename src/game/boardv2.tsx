/* eslint-disable @next/next/no-img-element */
"use client";

import React, {
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AllowedMove,
  Coordinate,
  GHQState,
  NonNullSquare,
  Orientation,
  Player,
  ReserveFleet,
  type Square,
  Units,
} from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
import { useMachine } from "@xstate/react";
import { turnStateMachine } from "@/game/board-state";
import classNames from "classnames";
import { useHotkeys } from "react-hotkeys-hook";
import { Bombarded, bombardedSquares } from "@/game/move-logic";
import { SelectOrientation } from "@/game/select-orientation";
import CountdownTimer from "@/game/countdown";
import { Check, Crosshair, Flag, MoveRight, Percent, Undo } from "lucide-react";
import { colIndexToFile, rowIndexToRank } from "./notation";
import { HistoryLog } from "./HistoryLog";
import { getUsernames } from "@/lib/supabase";
import EvalBar from "./EvalBar";
import {
  coordsForThisTurnMoves,
  getAllowedMoves,
  getOpponent,
  isBombardedBy,
  isPieceArtillery,
  PlayerPiece,
} from "./board-moves";

import { useMeasure } from "@uidotdev/usehooks";
import { Button } from "@/app/live/Button";
import { useRouter } from "next/navigation";
import AbortGameButton from "./AbortGameButton";
import Header from "@/components/Header";
import BoardArrow from "./BoardArrow";
import { useBoardArrow } from "./BoardArrowProvider";
import { playCaptureSound, playMoveSound } from "./audio";
import {
  columns,
  MOVE_SPEED_MS,
  rows,
  pieceSizes,
  squareSizes,
} from "@/game/constants";
import ShareGameDialog from "./ExportGameDialog";
import BoardContainer from "./BoardContainer";
import MoveCounter from "./MoveCounter";
import LongPressTD from "@/components/LongPressDiv";
import HowToPlayView from "./HowToPlayView";
import { Ctx } from "boardgame.io";
import { areCoordsEqual } from "./capture-logic";
import { ReserveBank } from "./board";

export function GHQBoardV2(props: BoardProps<GHQState>) {
  const { ctx, G, moves, playerID, undo, redo, plugins, log } = props;
  const [userActionState, setUserActionState] = useState<UserActionState>({});
  const currentPlayerTurn = useMemo(
    () => playerIdToPlayer(ctx.currentPlayer),
    [ctx.currentPlayer]
  );
  const usernames = ["Player 1", "Player 2"];
  const possibleAllowedMoves = useMemo(
    () =>
      getAllowedMoves({
        board: G.board,
        redReserve: G.redReserve,
        blueReserve: G.blueReserve,
        currentPlayerTurn,
        thisTurnMoves: G.thisTurnMoves,
      }),
    [G.board, G.redReserve, G.blueReserve, currentPlayerTurn, G.thisTurnMoves]
  );

  return (
    <div className="flex flex-col absolute w-[360px] lg:w-[600px] overflow-x-hidden overflow-y-auto">
      <Reserve
        G={G}
        ctx={ctx}
        player={getOpponent(currentPlayerTurn)}
        currentPlayerTurn={currentPlayerTurn}
        usernames={usernames}
        userActionState={userActionState}
        selectReserve={(kind) =>
          setUserActionState((userActionState) =>
            updateReserveClick(userActionState, kind, possibleAllowedMoves)
          )
        }
      />
      <Board
        {...props}
        userActionState={userActionState}
        setUserActionState={setUserActionState}
        possibleAllowedMoves={possibleAllowedMoves}
      />
      <Reserve
        G={G}
        ctx={ctx}
        player={currentPlayerTurn}
        currentPlayerTurn={currentPlayerTurn}
        usernames={usernames}
        userActionState={userActionState}
        selectReserve={(kind) =>
          setUserActionState((userActionState) =>
            updateReserveClick(userActionState, kind, possibleAllowedMoves)
          )
        }
      />
    </div>
  );
}

interface UserActionState {
  selectedPiece?: PlayerPiece;
  selectedReserve?: keyof ReserveFleet;
  hoveredCoordinate?: Coordinate;
  movePreference?: Coordinate;
  candidateMoves?: AllowedMove[];
  chosenMove?: AllowedMove;
  chosenMoves?: AllowedMove[];
}

function updateClick(
  self: UserActionState,
  board: GHQState["board"],
  square: Square,
  [rowIndex, colIndex]: Coordinate,
  possibleAllowedMoves: AllowedMove[],
  currentPlayer: Player,
  currentPlayerTurn: Player
): UserActionState {
  // You can only play on your turn.
  if (currentPlayer !== currentPlayerTurn) {
    return self;
  }

  // If we have chosen candidates already, let's lock in the final move.
  const chosenMove = self.chosenMoves?.find(
    (move) =>
      (move.name === "Move" &&
        areCoordsEqual(move.args[2] ?? [-1, -1], [rowIndex, colIndex])) ||
      (move.name === "MoveAndOrient" &&
        isBombardedBy(board, move.args[0], move.args[1], move.args[2], [
          rowIndex,
          colIndex,
        ])) ||
      (move.name === "Reinforce" &&
        areCoordsEqual(move.args[1], [rowIndex, colIndex]))
  );
  if (self.selectedPiece && chosenMove) {
    return {
      chosenMove,
    };
  }

  const choseCandidateMoves =
    self.candidateMoves?.filter(
      (move) =>
        (move.name === "Move" &&
          areCoordsEqual(move.args[1], [rowIndex, colIndex])) ||
        (move.name === "MoveAndOrient" &&
          areCoordsEqual(move.args[1], [rowIndex, colIndex])) ||
        (move.name === "Reinforce" &&
          areCoordsEqual(move.args[1], [rowIndex, colIndex]))
    ) ?? [];

  // If a move was already chosen out of a possible set of one moves, then we should play that move.
  if (
    (self.selectedPiece || self.selectedReserve) &&
    choseCandidateMoves.length === 1
  ) {
    return {
      chosenMove: choseCandidateMoves[0],
    };
  }

  // If there are multiple moves, then we need to provide the user with a choice.
  if (self.selectedPiece && choseCandidateMoves.length > 1) {
    return {
      ...self,
      chosenMoves: choseCandidateMoves,
    };
  }

  // If the square contains a piece, and it's the current player's piece, then we should show the possible moves.
  if (square && square.player === currentPlayer) {
    const coordinate: Coordinate = [rowIndex, colIndex];
    const candidateMoves =
      possibleAllowedMoves.filter(
        (move) =>
          (move.name === "Move" && areCoordsEqual(coordinate, move.args[0])) ||
          (move.name === "MoveAndOrient" &&
            areCoordsEqual(coordinate, move.args[0]))
      ) ?? [];

    // If there are no candidate moves, then we should clear the state.
    if (candidateMoves.length === 0) {
      return {};
    }

    return {
      candidateMoves,
      selectedPiece: {
        piece: square,
        coordinate: [rowIndex, colIndex],
      },
    };
  }

  // Otherwise, we should clear the state.
  return {};
}

function updateHover(
  self: UserActionState,
  [rowIndex, colIndex]: Coordinate
): UserActionState {
  return {
    ...self,
    hoveredCoordinate: [rowIndex, colIndex],
  };
}

function updateReserveClick(
  self: UserActionState,
  kind: keyof ReserveFleet,
  possibleAllowedMoves: AllowedMove[]
): UserActionState {
  const candidateMoves =
    possibleAllowedMoves.filter(
      (move) => move.name === "Reinforce" && move.args[0] === kind
    ) ?? [];
  return {
    candidateMoves,
    selectedReserve: kind,
  };
}

function playerIdToPlayer(playerId: string): Player {
  return playerId === "0" ? "RED" : "BLUE";
}

function Board({
  ctx,
  G,
  moves,
  playerID,
  undo,
  redo,
  plugins,
  log,
  userActionState,
  setUserActionState,
  possibleAllowedMoves,
}: BoardProps<GHQState> & {
  userActionState: UserActionState;
  setUserActionState: React.Dispatch<React.SetStateAction<UserActionState>>;
  possibleAllowedMoves: AllowedMove[];
}) {
  const currentPlayerTurn = useMemo(
    () => playerIdToPlayer(ctx.currentPlayer),
    [ctx.currentPlayer]
  );
  const currentPlayer = useMemo(
    () => (playerID === null ? currentPlayerTurn : playerIdToPlayer(playerID)),
    [currentPlayerTurn, playerID]
  );
  const bombarded = useMemo(() => bombardedSquares(G.board), [G.board]);
  const board = useMemo(() => G.board, [G.board]);

  const [measureRef, { width, height }] = useMeasure();

  const [squareSize, pieceSize] = useMemo(() => {
    const smallestDim: number = Math.min(width || 0, height || 0);
    if (smallestDim && smallestDim - squareSizes.large * 8 >= 0) {
      return [squareSizes.large, pieceSizes.large];
    } else {
      return [squareSizes.small, pieceSizes.small];
    }
  }, [width, height]);

  useEffect(() => {
    if (!userActionState.chosenMove) {
      return;
    }

    const { name, args } = userActionState.chosenMove;
    moves[name](...args);
  }, [userActionState.chosenMove]);

  const handleRightClickDrag = (
    from: [number, number],
    to: [number, number]
  ): void => {};

  const handleLeftClick = useCallback(
    ([rowIndex, colIndex]: Coordinate) => {
      const square = board[rowIndex][colIndex];
      setUserActionState((userActionState) =>
        updateClick(
          userActionState,
          board,
          square,
          [rowIndex, colIndex],
          possibleAllowedMoves,
          currentPlayer,
          currentPlayerTurn
        )
      );
    },
    [board, possibleAllowedMoves]
  );

  const handleMouseOver = useCallback(([rowIndex, colIndex]: Coordinate) => {
    setUserActionState((userActionState) =>
      updateHover(userActionState, [rowIndex, colIndex])
    );
  }, []);

  return (
    <BoardContainer
      ref={measureRef}
      onRightClickDrag={handleRightClickDrag}
      onLeftClick={handleLeftClick}
      onMouseOver={handleMouseOver}
      flipped={currentPlayer === "BLUE"}
    >
      {G.board.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex" }}>
          {row.map((square, colIndex) => (
            <Square
              key={colIndex}
              squareSize={squareSize}
              pieceSize={pieceSize}
              squareState={getSquareState({
                G,
                rowIndex,
                colIndex,
                square,
                bombarded,
                userActionState,
              })}
            />
          ))}
        </div>
      ))}
    </BoardContainer>
  );
}

interface SquareState {
  rowIndex: number;
  colIndex: number;
  square: Square;
  stagedSquare: Square;
  isRedBombarded: boolean;
  isBlueBombarded: boolean;
  isSelected: boolean;
  isCaptureCandidate: boolean;
  isBombardCandidate: boolean;
  showTarget: boolean;
  wasRecentlyCaptured: boolean;
  wasRecentlyMovedTo: boolean;
  isMovable: boolean;
  isRightClicked: boolean;
  isHovered: boolean;
  isMidMove: boolean;
  shouldAnimateFrom: Coordinate | undefined;
}

function getSquareState({
  G,
  square,
  rowIndex,
  colIndex,
  bombarded,
  userActionState,
}: {
  G: GHQState;
  rowIndex: number;
  colIndex: number;
  square: Square;
  bombarded: Bombarded;
  userActionState: UserActionState | null;
}): SquareState {
  let isMovable = false;
  let isCaptureCandidate = false;

  // #perf-improvement-possible
  for (const move of userActionState?.candidateMoves ?? []) {
    if (
      move.name === "Move" &&
      areCoordsEqual([rowIndex, colIndex], move.args[1])
    ) {
      isMovable = true;
    } else if (
      move.name === "MoveAndOrient" &&
      areCoordsEqual([rowIndex, colIndex], move.args[1])
    ) {
      isMovable = true;
    } else if (
      move.name === "Reinforce" &&
      areCoordsEqual([rowIndex, colIndex], move.args[1])
    ) {
      isMovable = true;
    }

    if (
      move.name === "Move" &&
      areCoordsEqual([rowIndex, colIndex], move.args[2] ?? [-1, -1])
    ) {
      isCaptureCandidate = true;
    }
  }

  let isSelected = areCoordsEqual(
    [rowIndex, colIndex],
    userActionState?.selectedPiece?.coordinate ?? [-1, -1]
  );
  let isMidMove = false;
  let stagedSquare = null;
  let isBombardCandidate = false;

  // #perf-improvement-possible
  for (const move of userActionState?.chosenMoves ?? []) {
    if (
      (move.name === "Move" || move.name === "MoveAndOrient") &&
      areCoordsEqual([rowIndex, colIndex], move.args[0])
    ) {
      isMidMove = true;
      isSelected = false;
    }

    if (
      (move.name === "Move" || move.name === "MoveAndOrient") &&
      areCoordsEqual([rowIndex, colIndex], move.args[1])
    ) {
      isSelected = true;
      const [row, col] = move.args[0];
      stagedSquare = structuredClone(G.board[row][col]);

      if (
        stagedSquare &&
        move.name === "MoveAndOrient" &&
        userActionState?.hoveredCoordinate
      ) {
        stagedSquare.orientation = getOrientationBetween(
          [rowIndex, colIndex],
          userActionState.hoveredCoordinate
        );
      }
    }

    if (
      move.name === "MoveAndOrient" &&
      isBombardedBy(G.board, move.args[0], move.args[1], move.args[2], [
        rowIndex,
        colIndex,
      ])
    ) {
      isBombardCandidate = true;
    }
  }

  // Piece is actively hovered or is a move preference.
  const isHovered =
    areCoordsEqual(userActionState?.hoveredCoordinate ?? [-1, -1], [
      rowIndex,
      colIndex,
    ]) ||
    areCoordsEqual(userActionState?.movePreference ?? [-1, -1], [
      rowIndex,
      colIndex,
    ]);

  let shouldAnimateFrom: Coordinate | undefined = undefined;
  if (G.thisTurnMoves.length > 0) {
    const mostRecentMove = G.thisTurnMoves[G.thisTurnMoves.length - 1];
    if (
      mostRecentMove.name === "Move" &&
      areCoordsEqual(mostRecentMove.args[1], [rowIndex, colIndex])
    ) {
      shouldAnimateFrom = mostRecentMove.args[0];
    }
  }

  return {
    rowIndex,
    colIndex,
    square,
    stagedSquare,
    isRedBombarded: bombarded[`${rowIndex},${colIndex}`]?.RED ?? false,
    isBlueBombarded: bombarded[`${rowIndex},${colIndex}`]?.BLUE ?? false,
    isSelected,
    showTarget: false,
    wasRecentlyCaptured: false,
    wasRecentlyMovedTo: false,
    isMovable,
    isCaptureCandidate,
    isBombardCandidate,
    isRightClicked: false,
    isHovered,
    isMidMove,
    shouldAnimateFrom,
  };
}

function Square({
  squareSize,
  pieceSize,
  squareState,
}: {
  squareSize: number;
  pieceSize: number;
  squareState: SquareState;
}) {
  const { rowIndex, colIndex, square, stagedSquare, shouldAnimateFrom } =
    squareState;
  const displaySquare = stagedSquare ?? square;
  const imageRef: Ref<HTMLImageElement> = useRef(null);
  const [animationState, setAnimationState] = useState<
    "started" | "ongoing" | "ended" | null
  >(null);

  function getTransform(square: NonNullSquare, isStartOfAnimation: boolean) {
    const isFlipped = shouldFlipSquare(square);
    const rotation = square.orientation ?? (isFlipped ? 180 : 0);
    let transform = `rotate(${rotation}deg)`;

    if (shouldAnimateFrom) {
      const [fromRow, fromCol] = shouldAnimateFrom;
      const [toRow, toCol] = [rowIndex, colIndex];
      const deltaX = (fromCol - toCol) * squareSize * (isFlipped ? -1 : 1);
      const deltaY = (fromRow - toRow) * squareSize * (isFlipped ? -1 : 1);

      if (isStartOfAnimation) {
        transform += ` translate(${deltaX}px, ${deltaY}px)`;
      } else {
        transform += ` translate(0px, 0px)`;
      }
    }

    return transform;
  }

  useEffect(() => {
    if (imageRef.current && displaySquare) {
      imageRef.current.style.position = "absolute";
      imageRef.current.style.zIndex = "50";
      imageRef.current.style.transform = getTransform(displaySquare, true);
      setAnimationState("started");
    }
  }, [imageRef.current, displaySquare]);

  useEffect(() => {
    if (animationState !== "started") {
      return;
    }

    setAnimationState("ongoing");

    setTimeout(() => {
      if (imageRef.current && displaySquare) {
        imageRef.current.style.transition = "transform 0.2s ease-out";
        imageRef.current.style.transform = getTransform(displaySquare, false);
        imageRef.current.style.position = "relative";
        imageRef.current.style.zIndex = "1";
      }
    }, 50);
  }, [imageRef.current, squareState.shouldAnimateFrom, animationState]);

  return (
    <div
      style={{
        width: squareSize,
        height: squareSize,
      }}
      data-row-index={rowIndex}
      data-col-index={colIndex}
      key={`${rowIndex},${colIndex}`}
      className={classNames(
        "relative flex items-center justify-center select-none font-bold text-3xl"
      )}
    >
      <SquareBackground squareState={squareState} />
      {displaySquare && (
        <img
          ref={imageRef}
          className={classNames("pointer-events-none", {
            "opacity-25": squareState.isMidMove,
            "opacity-75": squareState.stagedSquare,
          })}
          src={`/${
            Units[displaySquare.type].imagePathPrefix
          }-${displaySquare.player.toLowerCase()}.png`}
          width={pieceSize}
          height={pieceSize}
          draggable="false"
          alt={Units[displaySquare.type].imagePathPrefix}
        />
      )}
    </div>
  );
}

function SquareBackground({ squareState }: { squareState: SquareState }) {
  let baseBackground =
    (squareState.rowIndex + squareState.colIndex) % 2 === 0
      ? "bg-slate-400/70"
      : "bg-slate-200";

  if (squareState.isRedBombarded && squareState.isBlueBombarded) {
    baseBackground = "stripe-red-blue";
  } else if (squareState.isRedBombarded) {
    baseBackground = "stripe-red-transparent";
  } else if (squareState.isBlueBombarded) {
    baseBackground = "stripe-blue-transparent";
  }

  return (
    <>
      <SquareBackgroundColor className={baseBackground} />
      {squareState.isCaptureCandidate && (
        <>
          <SquareBackgroundColor
            className={classNames("z-10", {
              "bg-red-400/60": !squareState.isHovered,
              "bg-red-800/80": squareState.isHovered,
            })}
          />
          <Crosshair className="absolute z-10 text-red-200 w-1/2 h-1/2 pointer-events-none" />
        </>
      )}
      {squareState.isSelected && (
        <SquareBackgroundColor className="bg-green-800/50" />
      )}
      {squareState.isMovable &&
        (squareState.isHovered ? (
          <SquareBackgroundColor className="bg-green-800/50" />
        ) : (
          <div className="absolute rounded-full bg-green-700/50 w-1/3 h-1/3 pointer-events-none"></div>
        ))}
      {squareState.isBombardCandidate &&
        (squareState.isHovered ? (
          <SquareBackgroundColor className="bg-yellow-600/80" />
        ) : (
          <div
            className={
              "absolute rounded-full bg-yellow-400/80 w-1/3 h-1/3 pointer-events-none"
            }
          ></div>
        ))}
    </>
  );
}

function SquareBackgroundColor({ className }: { className: string }) {
  return (
    <div
      className={classNames(
        "absolute w-full h-full top-0 left-0 pointer-events-none",
        className
      )}
    ></div>
  );
}

function shouldFlipSquare(square: NonNullSquare): boolean {
  if (!isPieceArtillery(square)) {
    return square.player === "BLUE";
  }

  return false;
}

function Reserve({
  G,
  ctx,
  player,
  currentPlayerTurn,
  userActionState,
  usernames,
  selectReserve,
}: {
  G: GHQState;
  ctx: Ctx;
  player: Player;
  currentPlayerTurn: Player;
  userActionState: UserActionState;
  usernames: string[];
  selectReserve: (kind: keyof ReserveFleet) => void;
}) {
  return (
    <>
      <div className="items-center justify-center flex py-2 px-1">
        <ReserveBank
          player={player}
          reserve={player === "RED" ? G.redReserve : G.blueReserve}
          selectedKind={
            player === currentPlayerTurn
              ? userActionState.selectedReserve
              : undefined
          }
          selectable={player === currentPlayerTurn}
          selectReserve={selectReserve}
        />
        <div className="ml-4 lg:ml-20 my-2 flex flex-col gap-1">
          <div>
            {usernames[1]} ({G.elos[1]})
          </div>
          <div className="flex gap-2 justify-center items-center">
            <MoveCounter
              numMoves={ctx.numMoves}
              active={currentPlayerTurn === player && !ctx.gameover}
            />
            <CountdownTimer
              active={currentPlayerTurn === player && !ctx.gameover}
              player={player}
              elapsed={player === "RED" ? G.redElapsed : G.blueElapsed}
              startDate={G.turnStartTime}
              totalTimeAllowed={G.timeControl}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function getOrientationBetween(from: Coordinate, to: Coordinate): Orientation {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  if (fromRow === toRow) {
    return toCol > fromCol ? 90 : 270;
  } else if (fromCol === toCol) {
    return toRow > fromRow ? 180 : 0;
  } else if (toRow > fromRow && toCol > fromCol) {
    return 135;
  } else if (toRow > fromRow && toCol < fromCol) {
    return 225;
  } else if (toRow < fromRow && toCol > fromCol) {
    return 45;
  } else {
    return 315;
  }
}
