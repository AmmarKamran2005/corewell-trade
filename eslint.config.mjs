import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      /**
       * React Hook Form's `form.watch()` returns a function the React Compiler
       * cannot memoise, so the compiler skips optimising those components. That
       * is a performance note, not a correctness problem, and `watch()` is the
       * right API for how these forms read their own values.
       *
       * The suggested alternative, `useWatch`, is not a drop-in: it scopes the
       * subscription differently and can return a different value on the first
       * render. Several of these call sites feed straight into running totals
       * and balance checks (journal entries, invoices, GRNs), so swapping them
       * would risk a wrong figure on first paint for no functional gain.
       *
       * Revisit if these forms are ever rewritten.
       */
      "react-hooks/incompatible-library": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
