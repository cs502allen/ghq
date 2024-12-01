import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import HomeButton from "@/components/board/HomeButton";

export default function GameoverDialog({ abandoned }: { abandoned?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (abandoned) {
      setOpen(true);
    }
  }, [abandoned]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Game abandoned</DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex flex-col gap-2">
            <div>Game has been abandoned.</div>

            <div className="flex gap-1">
              <HomeButton />
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
