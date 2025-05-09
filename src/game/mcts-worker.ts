import { MCTSBot } from "boardgame.io/ai";
import { Game, State, Ctx } from "boardgame.io";
import { GHQState } from "./engine";

// Create a minimal game object that only includes what we need
const minimalGame = {
  moveNames: ["Move", "MoveAndOrient", "ChangeOrientation", "Reinforce"],
  processMove: (G: any, ctx: any, move: any) => {
    // This is a simplified version - in practice, you'd need to implement
    // the actual move processing logic here
    return G;
  },
};

// Handle messages from the main thread
self.onmessage = (e) => {
  const { state, playerID, iterations, playoutDepth, allowedMoves } = e.data;

  // Create a new MCTS bot instance with just the necessary data
  const bot = new MCTSBot({
    game: minimalGame,
    enumerate: () => allowedMoves,
    iterations,
    playoutDepth,
  });

  // Get the bot's move
  const move = bot.play(state, playerID);

  // Send the move back to the main thread
  self.postMessage({ move });
};
