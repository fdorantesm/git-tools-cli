import path from "node:path";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import packageJson from "./package.json" assert { type: "json" };

const externalDeps = [
  "@nestjs/common",
  "@nestjs/core",
  "chalk",
  "commander",
  "inquirer",
  "reflect-metadata",
  "rxjs",
  "simple-git",
  "node:child_process",
  "node:fs",
  "node:os",
  "node:path",
  "node:process",
  "node:url",
];

export default defineConfig({
  resolve: {
    alias: {
      "@/src": path.resolve(__dirname, "src"),
      "@/tests": path.resolve(__dirname, "tests"),
    },
  },
  build: {
    target: "node18",
    outDir: "dist",
    sourcemap: true,
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        "cli/index": path.resolve(__dirname, "src/cli/index.ts"),
      },
      formats: ["cjs"],
      fileName: (_format, entryName) =>
        entryName === "cli/index" ? "cli/index.js" : "index.js",
    },
    rollupOptions: {
      external: externalDeps,
      output: {
        chunkFileNames: "chunks/[name]-[hash].js",
        exports: "named",
        banner: chunk =>
          chunk.name === "cli/index" ? "#!/usr/bin/env node" : undefined,
      },
    },
    emptyOutDir: false,
    minify: false,
  },
  plugins: [
    dts({
      entryRoot: "src",
      tsconfigPath: "tsconfig.prod.json",
      outDir: "dist",
      rollupTypes: true,
      copyDtsFiles: true,
      include: ["src"],
    }),
  ],
  define: {
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
    __PACKAGE_DESCRIPTION__: JSON.stringify(packageJson.description ?? ""),
  },
});
