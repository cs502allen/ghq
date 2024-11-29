import { useHotkeys } from "react-hotkeys-hook";

export interface ControlsProps {
  undo: () => void;
  redo: () => void;
  cancel: () => void;
  replay: () => void;
}

export default function useControls({
  undo,
  redo,
  cancel,
  replay,
}: ControlsProps) {
  useHotkeys(
    "escape",
    (e) => {
      e.preventDefault();
      cancel();
    },
    []
  );

  useHotkeys(
    "left",
    (e) => {
      e.preventDefault();
      undo();
    },
    []
  );

  useHotkeys(
    "right",
    (e) => {
      e.preventDefault();
      redo();
    },
    []
  );

  useHotkeys(
    "space",
    (e) => {
      e.preventDefault();
      replay();
    },
    [replay]
  );

  return {};
}
