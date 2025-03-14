// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node", // Correct pour les tests API
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Alias pour imports
  },
};

export default config;