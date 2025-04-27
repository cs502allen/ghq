import { useState } from "react";

export default function Button({
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
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 w-full border-2 border-blue-900 rounded max-w-60"
      onClick={doOnClick}
    >
      {loading ? <div>{_loadingText}</div> : children}
    </button>
  );
}
