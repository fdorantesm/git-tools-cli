import js from "@eslint/js";
import eslintPluginN from "eslint-plugin-n";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import eslintPluginVitest from "eslint-plugin-vitest";
import tseslint from "typescript-eslint";

const importGroups = [
  [
    "^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)",
    "^node:(.*)$",
  ],
  ["^node:"],
  ["^@?\\w"],
  ["^@/tests(/.*|$)"],
  ["^@/src(/.*|$)"],
  ["^"],
  ["^\\."],
];

const basePlugins = {
  "simple-import-sort": eslintPluginSimpleImportSort,
  unicorn: eslintPluginUnicorn,
  n: eslintPluginN,
};

const baseRules = {
  "simple-import-sort/imports": [
    "error",
    {
      groups: importGroups,
    },
  ],
  "simple-import-sort/exports": "error",
  "unicorn/prefer-module": "off",
  "unicorn/prefer-top-level-await": "off",
  "unicorn/prevent-abbreviations": "off",
  "no-console": "off",
  "n/no-missing-import": "off",
  "n/no-unsupported-features/es-syntax": ["error", { ignores: ["modules"] }],
  "n/no-unpublished-import": "off",
  "no-process-exit": "off",
};

const tsFiles = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"];

const typescriptConfigs = [
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: tsFiles,
  })),
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: tsFiles,
  })),
  {
    files: tsFiles,
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: basePlugins,
    rules: {
      ...baseRules,
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
];

export default [
  {
    ignores: ["dist", "coverage", "node_modules"],
  },
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ["**/*.js"],
    plugins: basePlugins,
    rules: baseRules,
  },
  ...typescriptConfigs,
  eslintPluginVitest.configs.recommended,
  {
    files: ["tests/**"],
    rules: {
      "@typescript-eslint/unbound-method": "off",
      "vitest/expect-expect": "off",
      "vitest/no-standalone-expect": "off",
    },
  },
  {
    files: ["playground/**"],
    rules: {
      "no-console": "off",
    },
  },
];
