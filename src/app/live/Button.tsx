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
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
      onClick={doOnClick}
    >
      {loading ? <div>{_loadingText}</div> : children}
    </button>
  );
}
