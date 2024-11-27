"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AllowedMove, GHQState, Player } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
import { HistoryState } from "@/game/move-history-plugin";
import { UserActionState } from "./state";
import { playCaptureSound, playMoveSound } from "@/game/audio";
import { Ctx } from "boardgame.io";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function useBoard({
  ctx,
  G,
  moves,
  plugins,
  userActionState,
  currentPlayer,
  currentPlayerTurn,
}: {
  ctx: Ctx;
  G: GHQState;
  moves: BoardProps<GHQState>["moves"];
  plugins: BoardProps<GHQState>["plugins"];
  currentPlayer: Player;
  currentPlayerTurn: Player;
  userActionState: UserActionState;
}) {
  const [board, setBoard] = useState<GHQState["board"]>(G.board);
  const [mostRecentMove, setMostRecentMove] = useState<
    AllowedMove | undefined
  >();

  const animateOpponentsTurnToLatestBoardState = useCallback(() => {
    // Only animate when it's our turn (opponent's move has ended)
    if (currentPlayerTurn === currentPlayer) {
      // Slowly re-apply the state to allow for animations.
      for (const [i, board] of G.lastTurnBoards.entries()) {
        sleep(i * 250).then(() => {
          setBoard(board);

          const lastMove = G.lastPlayerMoves[i];
          setMostRecentMove(lastMove);

          if (lastMove.name === "Move" && lastMove.args[2]) {
            playCaptureSound();
          } else {
            playMoveSound();
          }
        });
      }

      // Wait for all the animations to finish before setting the final board state.
      sleep(G.lastTurnBoards.length * 250).then(() => setBoard(G.board));
    }
  }, [currentPlayerTurn, currentPlayer, G.lastTurnBoards, G.board]);

  // Change the board state when the current turn changes or it's game over.
  useEffect(() => {
    animateOpponentsTurnToLatestBoardState();
  }, [currentPlayerTurn, ctx.gameover]);

  // TODO(tyler): figure out why board doesn't update against bots
  // TODO(tyler): move history to game state not plugin so that log isn't wrong against bots and random sounds dont appear

  // Also change the board state when the current player makes a move.
  useEffect(() => {
    if (currentPlayerTurn === currentPlayer && G.thisTurnMoves.length >= 0) {
      // TODO(tyler): Animate moves forward, but not during undo.
      // setMostRecentMove(G.thisTurnMoves[G.thisTurnMoves.length - 1]);
      // sleep(250).then(() => setBoard(G.board));

      // Don't animate our own moves for now, just set the board state immediately.
      setMostRecentMove(undefined);
      setBoard(G.board);
    }
  }, [G.thisTurnMoves]);

  // Actually make the move that's been chosen by the user.
  useEffect(() => {
    if (userActionState.chosenMove) {
      const { name, args } = userActionState.chosenMove;
      moves[name](...args);

      if (name === "Move" && args[2]) {
        playCaptureSound();
      } else {
        playMoveSound();
      }
    }
  }, [userActionState.chosenMove]);

  // Play capture sounds when a start-of-turn capture has occurred.
  useEffect(() => {
    const systemMessages = plugins.history.data as HistoryState;
    const startOfTurnCaptures = systemMessages.log.find(
      ({ turn, isCapture }) => turn === ctx.turn && isCapture
    );
    if (startOfTurnCaptures) {
      playCaptureSound();
    }
  }, [ctx.turn, plugins.history.data]);

  return {
    board,
    mostRecentMove,
    replay: () => animateOpponentsTurnToLatestBoardState(),
  };
}
