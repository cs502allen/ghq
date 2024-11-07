export function rowIndexToRank(index: number): number {
  if (index < 0 || index > 7) {
    throw new Error("Index out of bounds");
  }
  return 8 - index;
}

export function colIndexToFile(index: number): string {
  if (index < 0 || index > 7) {
    throw new Error("Index out of bounds");
  }
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  return files[index];
}

export function coordinateToAlgebraic([x, y]: [number, number]): string {
  const rank = rowIndexToRank(x);
  const file = colIndexToFile(y);

  return `${file}${rank}`;
}

export function degreesToCardinal(degrees: number): string {
  if (degrees < 0 || degrees >= 360) {
    throw new Error("Degrees out of bounds");
  }

  const cardinals = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;

  return cardinals[index];
}
