export function GHQNight() {
  return (
    <div className="rounded p-4 bg-gradient-to-r from-blue-600 to-blue-800 flex flex-col gap-2 text-white">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="text-2xl font-bold">GHQ Tuesdays</div>
          <div className="text-right">
            <strong className="text-xl">8-10pm ET</strong>
            <div>
              <div className="text-sm">Every Tuesday night</div>
            </div>
          </div>
        </div>
        <div>
          <div>⭐ Play Rapid games with someone new</div>
          <div>
            ⭐ Chat with players on{" "}
            <a
              className="text-gray-100 hover:text-gray-200 underline decoration-gray-100"
              href="https://discord.gg/MDaTYTdG5e"
              target="_blank"
            >
              Discord
            </a>
          </div>

          <div>
            ⭐ Live on Twitch{" "}
            <a
              className="text-gray-100 hover:text-gray-200 underline decoration-gray-100"
              href="https://twitch.tv/tylerghq"
              target="_blank"
            >
              @TylerGHQ
            </a>{" "}
            teaching and playing
          </div>
        </div>
      </div>
    </div>
  );
}
