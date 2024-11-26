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
import { colIndexToFile, rowIndexToRank } from "../../game/notation";
import { HistoryLog } from "../../game/HistoryLog";
import { getUsernames } from "@/lib/supabase";
import EvalBar from "../../game/EvalBar";
import {
  coordsForThisTurnMoves,
  getAllowedMoves,
  getOpponent,
  isBombardedBy,
  isPieceArtillery,
  PlayerPiece,
} from "../../game/board-moves";

import { useMeasure } from "@uidotdev/usehooks";
import { Button } from "@/app/live/Button";
import { useRouter } from "next/navigation";
import AbortGameButton from "../../game/AbortGameButton";
import Header from "@/components/Header";
import BoardArrow from "../../game/BoardArrow";
import { useBoardArrow } from "../../game/BoardArrowProvider";
import { playCaptureSound, playMoveSound } from "../../game/audio";
import {
  columns,
  MOVE_SPEED_MS,
  rows,
  pieceSizes,
  squareSizes,
} from "@/game/constants";
import ShareGameDialog from "../../game/ExportGameDialog";
import BoardContainer from "../../game/BoardContainer";
import MoveCounter from "../../game/MoveCounter";
import LongPressTD from "@/components/LongPressDiv";
import HowToPlayView from "../../game/HowToPlayView";
import { Ctx } from "boardgame.io";
import { areCoordsEqual } from "../../game/capture-logic";
import { ReserveBank } from "../../game/board";
import { updateReserveClick, UserActionState } from "./state";
import Reserve from "./Reserve";
import Board from "./Board";

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

function playerIdToPlayer(playerId: string): Player {
  return playerId === "0" ? "RED" : "BLUE";
}
