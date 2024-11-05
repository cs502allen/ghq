export function playMoveSound() {
  if (typeof window !== "undefined") {
    const audio = new Audio("/move-piece.mp3");
    audio.volume = 0.2;
    audio.play();
  }
}

export function playCaptureSound() {
  if (typeof window !== "undefined") {
    const audio = new Audio("/capture-piece.mp3");
    audio.volume = 0.2;
    audio.play();
  }
}
