import React, { PropsWithChildren } from "react";
import { Orientation, Player } from "@/game/engine";
import classNames from "classnames";

export function SelectOrientation(
  props: PropsWithChildren<{
    player: Player;
    onChange: (orientation: Orientation) => void;
  }>
) {
  const color = props.player === "RED" ? "text-red-600" : "text-blue-600";

  const asBlue = props.player === "BLUE";

  return (
    <div
      className={classNames(
        "top-0 absolute overflow-hidden opacity-80 flex flex-col",
        color
      )}
      style={{ width: 90, height: 90 }}
    >
      <div className="grid grid-cols-7 gap-2 w-full">
        <div
          className="col-span-2  bg-slate-400 -rotate-45"
          onClick={() => {
            // @todo MAKE THIS PLAY NICE FOR BLUE
            props.onChange(asBlue ? 225 : 315);
          }}
        >
          ▲
        </div>
        <div
          className="col-span-3  bg-slate-400"
          onClick={() => {
            props.onChange(asBlue ? 180 : 0);
          }}
        >
          ▲
        </div>
        <div
          className="col-span-2  bg-slate-400 rotate-45"
          onClick={() => {
            props.onChange(asBlue ? 135 : 45);
          }}
        >
          ▲
        </div>
      </div>
      <div className="grid grid-cols-7 flex-1 items-center ">
        <div
          className="col-span-2  bg-slate-400 -rotate-90 "
          onClick={() => {
            props.onChange(270);
          }}
        >
          ▲
        </div>
        <div className="col-span-3">{props.children}</div>
        <div
          className="col-span-2  bg-slate-400 rotate-90"
          onClick={() => {
            props.onChange(90);
          }}
        >
          ▲
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 ">
        <div
          className="col-span-2  bg-slate-400 rotate-[-135deg]"
          onClick={() => {
            props.onChange(asBlue ? 315 : 225);
          }}
        >
          ▲
        </div>
        <div
          className="col-span-3  bg-slate-400 rotate-180"
          onClick={() => {
            props.onChange(asBlue ? 0 : 180);
          }}
        >
          ▲
        </div>
        <div
          className="col-span-2  bg-slate-400 rotate-[135deg]"
          onClick={() => {
            props.onChange(asBlue ? 45 : 135);
          }}
        >
          ▲
        </div>
      </div>
    </div>
  );
}
