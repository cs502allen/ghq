import { useState } from "react";

export function Button({
  children,
  onClick,
  loadingText,
}: Readonly<{
  children: React.ReactNode;
  onClick: () => Promise<void>;
  loadingText?: string;
}>) {
  const [loading, setLoading] = useState(false);

  async function doOnClick() {
    setLoading(true);
    onClick().finally(() => setLoading(false));
  }

  const _loadingText = loadingText || loading;

  return (
    <button
      className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-2 px-4 rounded-lg h-20 w-40"
      onClick={doOnClick}
    >
      {loading ? <div>{_loadingText}</div> : children}
    </button>
  );
}
