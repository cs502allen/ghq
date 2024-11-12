import Rules from "./Rules";

export function Learn() {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-2xl">About the game</div>
      <Rules />
    </div>
  );
}
