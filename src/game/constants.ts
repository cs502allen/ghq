export const rows = 8;
export const columns = 8;
export const MOVE_SPEED_MS = 250;
export const squareSizes = {
  small: 45,
  large: 75,
};
export const pieceSizes = {
  small: 30,
  large: 52,
};
export const TIME_CONTROLS = {
  // rapid: { time: 10 * 60 * 1000, bonus: 5 * 1000 },
  rapid: { time: 0, bonus: 0 },
  blitz: { time: 3 * 60 * 1000, bonus: 6 * 1000 },
};
