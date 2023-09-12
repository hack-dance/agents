import { defineConfig } from "tsup"

export default defineConfig(options => {
  return {
    entry: ["src/index.ts"],
    dts: true,
    watch: options.watch,
    sourcemap: true,
    minify: false,
    target: "es2020",
    format: ["cjs", "esm"],
    external: ["openai"]
  }
})
