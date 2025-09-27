import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  js.configs.recommended,
  { languageOptions: { parser: tsParser } },
  // グローバル定義 (browser + node)
  {
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        fetch: "readonly",
        URL: "readonly",
        window: "readonly",
        document: "readonly",
      },
    },
  },
  // 基本TS推奨設定 (eslint-plugin 提供設定を手動適用)
  {
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      ...tseslint.configs["recommended"].rules,
    },
  },
  {
    plugins: {
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // TypeScript specific tuning
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
  },
  // 生成物やビルド成果物は除外
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "src/generated/**",
      "src/components/ui/**",
      "src/lib/__tests__/**/*.d.ts",
    ],
  },
  // api-handler はラッパーパターン上 引数を意図的に無視することがあるため緩和
  {
    files: ["src/lib/api-handler.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-vars": "off",
    },
  },
];
