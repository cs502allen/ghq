import Image from "next/image";
import { PIECE_INFO, PieceInfo } from "@/lib/game-info";
import {
  ArrowBigRightDash,
  Ban,
  Bomb,
  Crosshair,
  PlaneTakeoff,
  RotateCw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function HowToPlayView() {
  return (
    <div className="m-2 p-2 h-[300px] overflow-y-auto border rounded flex flex-col gap-2">
      <div className="font-bold text-lg">How To Play</div>

      <div>
        <div className="font-bold">Pieces</div>
        <div className="flex flex-col gap-1">
          {Object.values(PIECE_INFO).map((piece) => (
            <PieceCard key={piece.name} piece={piece} />
          ))}
        </div>
      </div>
      <div>
        <div>
          <strong>Available moves</strong> (3 per turn)
        </div>
        <div className="flex flex-col">
          <div>
            <div>1. Deploy a piece from your reserve.</div>
            <div className="text-sm ml-5 text-gray-700">
              Click on a piece from the reserve section below the board and then
              click on a square on your home row to place it there.
            </div>
          </div>

          <div>
            <div>2. Move an infantry and/or capture a piece.</div>
            <div className="text-sm ml-5 text-gray-700">
              Click on an infantry and then click on a square to move it there.
              If you move to an square adjacent to an enemy piece, you can click
              the enemy piece to capture it.
            </div>
          </div>

          <div>
            <div>3. Move and/or rotate an artillery.</div>
            <div className="text-sm ml-5 text-gray-700">
              Click on an artillery and then click on a square to move it there.
              Click again to rotate the piece to face a different direction.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PieceCard({ piece }: { piece: PieceInfo }) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Image
            src={`/${piece.image}-blue.png`}
            alt={piece.name}
            width={14}
            height={14}
          />
          {piece.name}
        </div>
        <div className="grid grid-cols-6 gap-4 items-center">
          <ActionIcon
            icon={<ArrowBigRightDash className="w-4 h-4" />}
            text={piece.moveNum.toString()}
            tooltip={"Moves in " + piece.moves}
          />
          {piece.captures && (
            <ActionIcon
              icon={<Crosshair className="w-4 h-4" />}
              text={""}
              tooltip={"Captures " + piece.captures}
            />
          )}
          {piece.bombardNum && (
            <ActionIcon
              icon={<Bomb className="w-4 h-4" />}
              text={piece.bombardNum.toString()}
              tooltip={"Bombards " + piece.bombards}
            />
          )}
          {piece.isAirborne && (
            <ActionIcon
              icon={<PlaneTakeoff className="w-4 h-4" />}
              text={""}
              tooltip={piece.special!}
            />
          )}
          {piece.rotates && (
            <ActionIcon
              icon={<RotateCw className="w-4 h-4" />}
              text={""}
              tooltip={piece.special!}
            />
          )}
          {piece.isHq && (
            <ActionIcon
              icon={<Ban className="w-4 h-4" />}
              text={""}
              tooltip={piece.special!}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ActionIcon({
  icon,
  text,
  tooltip,
}: {
  icon: React.ReactNode;
  text: string;
  tooltip: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex gap-1 items-center justify-center">
            {text}
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
