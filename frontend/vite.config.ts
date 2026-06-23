import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const envDir = process.env.VITE_ENV_DIR
  ? path.resolve(process.env.VITE_ENV_DIR)
  : path.resolve(__dirname, "..");

export default defineConfig({
  envDir,
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // @ts-expect-error - Vitest config in vite.config.ts
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.claude/worktrees/**",
      "**/.git/**",
    ],
  },
});
