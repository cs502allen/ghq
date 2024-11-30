import { useHotkeys } from "react-hotkeys-hook";

export interface ControlsProps {
  undo: () => void;
  redo: () => void;
  cancel: () => void;
  skip: () => void;
  replay: () => void;
}

export default function useControls({
  undo,
  redo,
  cancel,
  skip,
  replay,
}: ControlsProps) {
  useHotkeys(
    "escape",
    (e) => {
      e.preventDefault();
      cancel();
    },
    [cancel]
  );

  useHotkeys(
    "left",
    (e) => {
      e.preventDefault();
      undo();
    },
    [undo]
  );

  useHotkeys(
    "right",
    (e) => {
      e.preventDefault();
      redo();
    },
    [redo]
  );

  useHotkeys(
    "space",
    (e) => {
      e.preventDefault();
      replay();
    },
    [replay]
  );

  useHotkeys(
    ".",
    (e) => {
      e.preventDefault();
      skip();
    },
    [skip]
  );

  return {};
}
