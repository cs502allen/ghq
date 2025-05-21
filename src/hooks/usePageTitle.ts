import { useEffect, useRef } from "react";

export function usePageTitle(title: string) {
  const originalTitle = useRef<string>(document.title);

  useEffect(() => {
    if (title) {
      document.title = `(${title}) ${originalTitle.current}`;
    } else {
      document.title = originalTitle.current;
    }

    return () => {
      document.title = originalTitle.current;
    };
  }, [title]);
}
