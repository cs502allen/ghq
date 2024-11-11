import Rules from "./Rules";

export function Learn() {
  return (
    <div className="flex flex-col gap-3 p-2">
      <div className="text-2xl mt-2">Learn to play</div>
      <Rules />
    </div>
  );
}
