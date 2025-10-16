import path from "node:path";

import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

import packageJson from "./package.json" assert { type: "json" };

export default defineConfig({
  resolve: {
    alias: {
      "@/src": path.resolve(__dirname, "src"),
      "@/tests": path.resolve(__dirname, "tests"),
    },
  },
  test: {
    root: "./",
    globals: true,
    isolate: false,
    passWithNoTests: true,
    include: ["tests/unit/**/*.test.ts"],
    env: loadEnv("test", process.cwd(), ""),
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
      reportsDirectory: "coverage/unit",
      include: ["src/**/*.ts"],
    },
  },
  plugins: [],
  define: {
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
    __PACKAGE_DESCRIPTION__: JSON.stringify(packageJson.description ?? ""),
  },
});
