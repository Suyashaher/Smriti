import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@engine": fileURLToPath(new URL("../ai/cognitive_engine/index.ts", import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: [".", "../ai"],
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "../ai/**/*.test.ts"],
  },
});

