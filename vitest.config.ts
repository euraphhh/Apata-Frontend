import { defineConfig } from "vitest/config";
import path from "node:path";
import {loadEnv} from 'vite'
export default defineConfig(({ mode }) => ({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    env: loadEnv(mode, process.cwd(), ''),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
