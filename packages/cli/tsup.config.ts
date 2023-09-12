import { defineConfig } from "tsup"

export default defineConfig(options => {
  return {
    entry: ["src/index.ts"],
    dts: true,
    watch: options.watch,
    sourcemap: true,
    minify: true,
    format: ["esm"],
    target: "esnext",
    outDir: "dist",
  }
})
