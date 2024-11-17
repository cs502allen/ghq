export interface Config {
  useClerk: boolean;
}

export const config: Config = {
  useClerk: process.env.NEXT_PUBLIC_GHQ_FRONTEND_ONLY !== "true",
};
