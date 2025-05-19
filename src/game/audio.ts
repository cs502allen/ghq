let audioContext: AudioContext | null = null;
let audioBuffers: { [key: string]: AudioBuffer } = {};

async function initAudio() {
  if (typeof window === "undefined" || audioContext) {
    return;
  }

  audioContext = new AudioContext();

  const audioFiles = {
    move: "/move-piece.mp3",
    capture: "/capture-piece.mp3",
    nextTurn: "/swoosh.mp3",
    gameReady: "/cold-wind-blowing.mp3",
  };

  for (const [key, url] of Object.entries(audioFiles)) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffers[key] = await audioContext.decodeAudioData(arrayBuffer);
  }
}

function playSound(audioName: string, volume: number) {
  if (
    typeof window === "undefined" ||
    !audioContext ||
    !audioBuffers[audioName]
  ) {
    return;
  }

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();

  source.buffer = audioBuffers[audioName];
  gainNode.gain.value = volume;

  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  source.start(0);
}

export const playMoveSound = () => playSound("move", 0.2);
export const playCaptureSound = () => playSound("capture", 0.2);
export const playNextTurnSound = () => playSound("nextTurn", 0.15);
export const playGameReadySound = () => playSound("gameReady", 1);

if (typeof window !== "undefined") {
  initAudio();
}
