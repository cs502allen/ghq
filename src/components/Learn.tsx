import Rules from "./Rules";

export function Learn() {
  return (
    <div className="flex flex-col gap-3">
      <div className="font-bold text-lg">About the game</div>
      <Rules />
    </div>
  );
}
