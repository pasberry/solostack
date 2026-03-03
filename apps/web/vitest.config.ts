import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "src/**/*.tsx", "packages/convex/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/**/*.stories.tsx"],
    },
  },
});
