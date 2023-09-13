// mostly ripped from: https://github.com/shadcn-ui/ui/blob/main/packages/cli/src/commands/add.ts
import { existsSync, promises as fs } from "fs"
import path from "path"

import chalk from "chalk"
import { Command } from "commander"
import { execa } from "execa"
import ora from "ora"
import prompts from "prompts"
import * as z from "zod"
import { everything } from "@/src-files"

const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string(),
  path: z.string().optional(),
})

export const add = new Command()
  .name("add")
  .description("add a component to your project")
  .argument("[components...]", "the components to add")
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-o, --overwrite", "overwrite existing files.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-p, --path <path>", "the path to add the component to.")
  .action(async (components, opts) => {
    try {
      const options = addOptionsSchema.parse({
        components,
        ...opts,
      })

      const cwd = path.resolve(options.cwd)
      let selectedComponents = options.components

      if (!options.components?.length) {
        const { components } = await prompts({
          type: "multiselect",
          name: "components",
          message: "Which components would you like to add?",
          hint: "Space to select. A to toggle all. Enter to submit.",
          instructions: false,
          choices: [{
            title: "Agents Core",
            value: "core"
          }, {
            title: "React hooks",
            value: "hooks"
          }],
        })

        selectedComponents = components
      }

      if (!selectedComponents?.length) {
        console.warn("No components selected. Exiting.")
        process.exit(0)
      }
      const payload = selectedComponents.map((component) => everything[component])

      if (!payload.length) {
        console.warn("Selected components not found. Exiting.")
        process.exit(0)
      }


      const spinner = ora(`Installing components...`).start()

      for (const item of payload) {
        spinner.text = `Installing ${item.name}...`
        let targetDir = options.path ? path.resolve(cwd, options.path) : cwd

        if (!existsSync(targetDir)) {
          await fs.mkdir(targetDir, { recursive: true })
        }


        const srcDir = path.resolve(targetDir, "src")

        if (existsSync(srcDir)) {
          targetDir = srcDir
        }

        for (const dir of item.dirs) {
          const dirPath = path.resolve(targetDir, dir)
          if (!existsSync(dirPath)) {
            await fs.mkdir(dirPath, { recursive: true })
          }
        }

        const existingComponent = item.files.filter((file) =>
          existsSync(path.resolve(targetDir, file.targetPath, file.fileName))
        )

        if (existingComponent.length && !options.overwrite) {
          if (selectedComponents.includes(item.name)) {
            spinner.fail(
              `Component ${item.name} already exists. Use ${chalk.green(
                "--overwrite"
              )} to overwrite.`
            )
            process.exit(1)
          }

          continue
        }

        for (const file of item.files) {
          const sourcePath = file.srcPath
          const targetPath = path.join(targetDir, file.targetPath, file.fileName)

          if (existsSync(targetPath) && !options.overwrite) {
            console.warn(
              `File ${file.fileName} already exists in ${file.targetPath}. Use ${chalk.green(
                "--overwrite"
              )} to overwrite.`
            )
            process.exit(1)
          }
          await fs.copyFile(sourcePath, targetPath)
        }


        if (item.dependencies?.length) {
          const packageManager = "pnpm" as "pnpm" | "yarn" | "npm" | "bun"

          await execa(
            packageManager,
            [
              packageManager === "npm" ? "install" : "add",
              ...item.dependencies,
            ],
            {
              cwd,
            }
          )
        }
      }

      spinner.succeed(`all done.`)
    } catch (error) {
      console.error(error)
    }
  })
