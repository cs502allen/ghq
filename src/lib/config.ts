export interface Config {
  useClerk: boolean;
}

export const production: Config = {
  useClerk: false,
};

export const local: Config = {
  useClerk: false,
};

const env = process.env.NEXT_PUBLIC_ENV;

// default to production, local otherwise
export const config = env === "local" ? local : production;
