export function GHQNight() {
  return (
    <div className="p-3 flex flex-col gap-2 bg-white">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="text-lg font-bold">GHQ Tuesday!</div>
          <div className="text-right">
            <strong className="text-lg">7-9pm ET</strong>
            <div>
              <div className="text-sm text-gray-600">April 29th, 2025</div>
            </div>
          </div>
        </div>
        <div className="text-sm">
          <div>⭐ Play Rapid games with someone new</div>
          <div>
            ⭐ Chat with players on{" "}
            <a
              className="text-blue-600 hover:text-blue-400 underline decoration-blue-600"
              href="https://discord.gg/MDaTYTdG5e"
              target="_blank"
            >
              Discord
            </a>
          </div>

          <div>
            ⭐ Live on Twitch{" "}
            <a
              className="text-blue-600 hover:text-blue-400 underline decoration-blue-600"
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
