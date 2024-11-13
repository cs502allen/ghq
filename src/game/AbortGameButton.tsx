import { useState } from "react";
import AbortGameModal from "./AbortGameModal";

export default function AbortGameButton({ matchId }: { matchId: string }) {
  const [openAbortModal, setOpenAbortModal] = useState(false);
  return (
    <>
      <button
        className="bg-red-500 text-white py-1 px-2 text-sm rounded hover:bg-red-600 flex gap-1 items-center"
        onClick={() => setOpenAbortModal(true)}
      >
        Abandon Game
      </button>
      <AbortGameModal
        matchId={matchId}
        open={openAbortModal}
        onClose={() => setOpenAbortModal(false)}
      />
    </>
  );
}
