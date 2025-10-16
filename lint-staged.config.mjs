const config = {
  "**/*.{ts?(x),mts}": () => "tsc -p tsconfig.prod.json --noEmit",
  "*.{js,jsx,mjs,cjs,ts,tsx,mts}": ["yarn lint", "yarn vitest related --run"],
  "*.{md,json}": "prettier --write",
  "*": "yarn typos",
  "*.{yml,yaml}": "yarn lint:yaml",
};

export default config;
