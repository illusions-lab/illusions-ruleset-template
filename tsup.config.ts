import { defineConfig } from "tsup";

/**
 * Builds src/index.ts → dist/index.js as a single self-contained ESM module.
 *
 * The runtime base classes and detectors are received via `ctx` (not bundled),
 * so the output stays small. `manifest.json` is embedded via the JSON import.
 *
 * For closed-source distribution, run `npm run build:min` (minified). For
 * stronger protection, obfuscate dist/index.js or compile rules to WASM — see
 * the illusions docs on closed-source rulesets.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  target: "es2022",
  platform: "neutral",
  bundle: true,
  clean: true,
  dts: false,
  sourcemap: false,
  // `illusions-lint-sdk` is type-only (erased at build); never bundle it.
  external: ["illusions-lint-sdk"],
});
