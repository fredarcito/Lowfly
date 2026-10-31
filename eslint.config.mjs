import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Next's rules (React, hooks, Core Web Vitals) plus the project's own from CLAUDE.md: functions as named arrows and
// descriptive names. `pnpm lint` runs it.
const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
      "id-length": ["error", { min: 2, exceptions: ["_"], properties: "never" }],
      "no-unused-vars": ["error", { args: "after-used", ignoreRestSiblings: true, caughtErrors: "none" }],
      // React Compiler's setState in an effect: the hooks were written before it, so for now it only warns. Fix
      // each hook as it is touched, then make it an error like the compiler's other rules.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // shadcn's components keep their own style
  {
    files: ["src/components/ui/**"],
    rules: { "func-style": "off", "id-length": "off" },
  },
  // Playwright's fixtures call `use`, which is not React's hook
  {
    files: ["e2e/**"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".agents/**", "e2e/report/**", "e2e/results/**", "p3002/**"]),
]);

export default eslintConfig;
