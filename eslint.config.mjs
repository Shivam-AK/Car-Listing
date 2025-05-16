import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    plugins: ["tailwindcss", "unused-imports"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    root: true,
    extends: [
      "next/core-web-vitals",
      "prettier",
      "plugin:tailwindcss/recommended",
      "eslint:recommended",
    ],
    rules: {
      semi: "error",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": "warn",
    },
    settings: {
      next: {
        rootDir: ["./src/"],
      },
    },
    ignorePatterns: [
      "node_modules",
      ".next",
      "prisma",
      ".vscode",
      ".env",
      ".env.*",
      "*.env",
    ],
  }),
];

export default eslintConfig;
