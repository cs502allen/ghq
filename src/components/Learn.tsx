import { boards } from "@/game/tutorial";

export function Learn() {
  // export const boards: Record<string, GHQState["board"]> = {

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-2xl mt-2">Learn to play</div>
      <div className="flex flex-col gap-1">
        {Object.keys(boards).map((boardType: string) => (
          <a
            key={boardType}
            href={`/learn?boardType=${boardType}`}
            className="py-2 px-3 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md"
          >
            <div className="tracking-tight text-gray-900">{boardType}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
