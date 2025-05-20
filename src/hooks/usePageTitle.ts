import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    if (title) {
      const baseTitle = document.title;
      document.title = `(${title}) ${baseTitle}`;
    }
  }, [title]);
}
