import { boards } from "@/game/tutorial";

export function Learn() {
  // export const boards: Record<string, GHQState["board"]> = {

  return (
    <div>
      <div className="text-2xl mt-2">Learn to play</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
