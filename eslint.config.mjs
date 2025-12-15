import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import honoPlugin from "./dist/index.mjs";

export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist", "coverage", ".git", "node_modules", "playground"],
  },
];
