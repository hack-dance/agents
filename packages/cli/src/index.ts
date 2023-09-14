#!/usr/bin/env node

// mostly ripped from: https://github.com/shadcn-ui/ui/blob/main/packages/cli/src/index.ts
import path from "path"
import { add } from "@/commands/add"
import { Command } from "commander"
import fs from "fs-extra"

const packageJson = fs.readJSONSync(path.join("package.json"))

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

async function main() {
  const program = new Command()
    .name("hack-dance-agents")
    .description("Hack Dance CLI")
    .version(packageJson.version || "1.0.0", "-v, --version", "display the version number")

  program.addCommand(add)
  program.parse()
}

main()
