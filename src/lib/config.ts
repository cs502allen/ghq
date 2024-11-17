export interface Config {
  useClerk: boolean;
}

export const config: Config = {
  useClerk: process.env.GHQ_FRONTEND_ONLY !== "true",
};
