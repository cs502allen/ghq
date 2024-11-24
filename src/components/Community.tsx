export function Community() {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-2xl">Community</div>
      <div className="text-sm">
        Every Tuesday at 8pm ET, we&apos;re live on Twitch{" "}
        <a
          className="text-blue-600 hover:text-blue-400"
          href="https://twitch.tv/tylerghq"
          target="_blank"
        >
          @TylerGHQ
        </a>
        . Join us to learn the basics and play some games!{" "}
      </div>
      <div className="text-sm">
        You can also join our{" "}
        <a
          className="text-blue-600 hover:text-blue-400"
          href="https://discord.gg/MDaTYTdG5e"
          target="_blank"
        >
          Discord
        </a>{" "}
        to find other players and chat about the game.
      </div>
    </div>
  );
}
