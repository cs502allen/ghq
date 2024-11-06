/**
 * Calculate the new Elo rating for a user.
 * @param currentRating - The current Elo rating of the user.
 * @param opponentRating - The Elo rating of the opponent.
 * @param score - The score of the match (1 for a win, 0.5 for a draw, 0 for a loss).
 * @param kFactor - The K-factor, which determines the sensitivity of the rating change.
 * @returns The new Elo rating.
 */
export function calculateElo(
  currentRating: number,
  opponentRating: number,
  score: number,
  kFactor: number = 32
): number {
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400));
  const newRating = currentRating + kFactor * (score - expectedScore);
  return Math.round(newRating);
}
