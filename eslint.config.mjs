// eslint.config.js (ESM)
import js from "@eslint/js";

export default [
  // 1) JS 基本建議
  js.configs.recommended,

  // 2) 基本配置
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      // 基本規則
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },

  // 3) 忽略清單
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];
