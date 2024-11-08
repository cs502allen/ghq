interface FetchOptions extends RequestInit {
  getToken: () => Promise<string | null>;
  url: string;
}

export async function ghqFetch<T>({
  url,
  getToken,
  ...options
}: FetchOptions): Promise<T> {
  const token = await getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return (await response.json()) as T;
}
