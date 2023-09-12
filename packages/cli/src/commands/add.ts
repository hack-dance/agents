import { existsSync, promises as fs } from "fs"
import path from "path"

import chalk from "chalk"
import { Command } from "commander"
import { execa } from "execa"
import ora from "ora"
import prompts from "prompts"
import * as z from "zod"

const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string(),
  path: z.string().optional(),
})

const root_path = path.resolve(__dirname, "../../..")

const everything = {
  core: {
    name: "core",
    dependencies: ["openai", "zod", "zod-to-json-schema"],
    dirs: ["utils", "ai/agents", "ai/fns"],
    files: [{
      name: "agent creators",
      targetPath: "ai/agents",
      fileName: "index.ts",
      srcPath: `${root_path}/packages/core/src/ai/agents/index.ts`,
    },{
      name: "OAI utils",
      targetPath: "utils",
      fileName: "oai.ts",
      srcPath: `${root_path}/packages/core/src/utils/oai.ts`,
    },{
      name: "OAI stream util",
      targetPath: "utils",
      fileName: "oai-stream.ts",
      srcPath: `${root_path}/packages/core/src/utils/oai-stream.ts`,
    },{
      name: "OAI fns",
      targetPath: "ai/fns",
      fileName: "index.ts",
      srcPath: `${root_path}/packages/core/src/ai/fns/index.ts`,
    },{
      name: "OAI Schema FN",
      targetPath: "ai/fns",
      fileName: "schema.ts",
      srcPath: `${root_path}/packages/core/src/ai/fns/schema.ts`,
    }]
  }
}

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
