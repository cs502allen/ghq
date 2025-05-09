"use client";

import { Client } from "boardgame.io/react";
import { useState, useEffect } from "react";
import ReplayCapability from "@/game/ReplayCapability";
import { Local } from "boardgame.io/multiplayer";
import { MCTSBot } from "boardgame.io/ai";
import { newBotGame } from "@/game/bot";
import { GHQBoardV2 } from "@/components/board/boardv2";
import { shouldUseBoardV2 } from "@/components/board/board-switcher";
import { GHQBoard } from "@/game/board";
import { Game, State, Ctx } from "boardgame.io";
import { GHQState } from "@/game/engine";
import { getAllowedMoves } from "@/game/board-moves";

type Move = { move: string; args: any[] };

// Async MCTS bot that uses chunked calculations
class AsyncMCTSBot extends MCTSBot {
  private isCalculating = false;
  private currentPromise: Promise<any> | null = null;
  private iterationsPerChunk = 50; // Do 50 iterations per chunk
  protected game: Game<GHQState>;
  public iterations: number;

  constructor(opts: any) {
    super({ ...opts, ...opts.game.ai });
    this.game = opts.game;
    this.iterations =
      typeof opts.game.ai.iterations === "function"
        ? opts.game.ai.iterations(opts.game, opts.ctx)
        : opts.game.ai.iterations;
  }

  async play(
    state: State<GHQState>,
    playerID: string
  ): Promise<{ action: any; metadata: any }> {
    if (this.isCalculating && this.currentPromise) {
      return this.currentPromise;
    }

    this.isCalculating = true;
    this.currentPromise = new Promise((resolve) => {
      let iterationsDone = 0;
      const totalIterations = this.iterations;
      let bestMove: Move | null = null;
      let bestScore = -Infinity;

      const calculateChunk = () => {
        if (!this.isCalculating) {
          return;
        }

        // Do a chunk of iterations
        const chunkStart = iterationsDone;
        const chunkEnd = Math.min(
          iterationsDone + this.iterationsPerChunk,
          totalIterations
        );

        for (let i = chunkStart; i < chunkEnd; i++) {
          // Run one iteration of MCTS
          const result = this.runIteration(state, playerID);
          if (result && result.score > bestScore) {
            bestScore = result.score;
            bestMove = result.move;
          }
        }

        iterationsDone = chunkEnd;

        // If we're done, resolve the promise
        if (iterationsDone >= totalIterations) {
          this.isCalculating = false;
          this.currentPromise = null;
          resolve({ action: bestMove, metadata: { score: bestScore } });
          return;
        }

        // Otherwise, schedule the next chunk
        requestAnimationFrame(calculateChunk);
      };

      // Start the calculation
      requestAnimationFrame(calculateChunk);
    });

    return this.currentPromise;
  }

  // Helper method to run one iteration of MCTS
  private runIteration(state: State<GHQState>, playerID: string) {
    const moves = this.game.ai?.enumerate(state.G, state.ctx, playerID);
    if (!moves || moves.length === 0) return null;

    // Convert moves to our format
    const formattedMoves: Move[] = moves.map((move) => {
      if ("type" in move && move.type === "MAKE_MOVE") {
        return {
          move: move.payload.type,
          args: move.payload.args,
        };
      }
      return {
        move: "event" in move ? move.event : "unknown",
        args: "args" in move ? move.args || [] : [],
      };
    });

    // Select a move using UCB1
    const move = this.selectMove(formattedMoves, state, playerID);

    // Simulate the move
    const score = this.simulateMove(move, state, playerID);

    return { move, score };
  }

  // Helper method to select a move using UCB1
  private selectMove(moves: Move[], state: State<GHQState>, playerID: string) {
    // Simple random selection for now - you can implement UCB1 here
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Helper method to simulate a move
  private simulateMove(move: Move, state: State<GHQState>, playerID: string) {
    // Simple random simulation for now
    return Math.random();
  }

  destroy() {
    this.isCalculating = false;
    this.currentPromise = null;
  }
}

const App = Client({
  game: newBotGame(),
  board: shouldUseBoardV2() ? GHQBoardV2 : GHQBoard,
  multiplayer: Local({ bots: { "1": AsyncMCTSBot } }),
});

export default function Page() {
  const [client, setClient] = useState<any | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (client?.bot) {
        client.bot.destroy();
      }
    };
  }, [client]);

  return (
    <div>
      {client && <ReplayCapability client={client} />}
      <App ref={(ref) => setClient(ref?.client)} playerID="0" />
    </div>
  );
}
