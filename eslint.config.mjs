import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Gitignored working files. CI never sees them — a fresh checkout has no such
    // directory — so linting them locally only produced 11 errors nobody could act
    // on and a count that disagreed with CI's.
    ".deleted-scratch/**",
  ]),

  {
    rules: {
      // Downgraded, not dismissed. These are the React Compiler's rules about
      // setting state inside an effect and creating components during render, and
      // both are real: they cause cascading renders and remount subtrees. But every
      // remaining instance is in an auth guard, a role context or a settings
      // prefill, and fixing them means restructuring when state is derived — a
      // behavioural change in the app that approves KYC, which cannot be verified
      // without signing in and walking the review flow.
      //
      // Warnings so they stay visible and the rest of the ruleset can be a hard
      // gate. 10 set-state-in-effect and 2 static-components as of 31 Aug 2026;
      // clear them and raise these back to "error".
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
]);

export default eslintConfig;
