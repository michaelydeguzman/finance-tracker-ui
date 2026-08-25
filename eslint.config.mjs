import eslintConfigNext from "eslint-config-next";
import eslintConfigPrettier from "eslint-config-prettier";

// `eslint-config-next` is intentionally ahead of `next` itself: the 15.x line
// is eslintrc-only and cannot load under ESLint 9's flat config.
const config = [
  {
    ignores: [
      ".next/**",
      ".cursor/**",
      "node_modules/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
  ...eslintConfigNext,
  eslintConfigPrettier,
];

export default config;
