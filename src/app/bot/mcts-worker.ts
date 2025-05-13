import { MCTSBot } from "boardgame.io/ai";
import type { State } from "boardgame.io";
import { newBotGame } from "@/game/bot";

console.log("Worker initializing...");

// Create the game instance once when the worker is initialized
const game = newBotGame();

if (!game.ai?.enumerate) {
  throw new Error("Game must have an AI enumerate function");
}

class CustomMCTSBot extends MCTSBot {
  constructor(opts: any) {
    super({
      ...opts,
      enumerate: game.ai!.enumerate,
      iterations: 100, // Reduced iterations for testing
      playoutDepth: 10, // Reduced depth for testing
    });
  }

  async play(state: State<any>, playerID: string) {
    console.log("MCTS bot play called with state:", state);
    try {
      const moves = game.ai!.enumerate(state.G, state.ctx, playerID);
      console.log("Available moves:", moves.length);

      const result = await super.play(state, playerID);
      console.log("MCTS bot play result:", result);
      return result;
    } catch (error) {
      console.error("Error in MCTS play:", error);
      throw error;
    }
  }
}

self.onmessage = async (e) => {
  console.log("Worker received message:", e.data);
  const { state, playerID } = e.data;

  try {
    console.log("Creating bot...");
    const bot = new CustomMCTSBot({
      game,
      playerID,
    });

    console.log("Starting bot calculation...");
    const result = await bot.play(state, playerID);
    console.log("Bot calculation complete, sending result:", result);
    self.postMessage({ move: result });
  } catch (error: any) {
    console.error("Error in bot calculation:", error);
    console.error("Error stack:", error?.stack);
    self.postMessage({
      error: error?.message || "Unknown error in bot calculation",
    });
  }
};
