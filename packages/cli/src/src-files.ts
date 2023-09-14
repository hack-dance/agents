import fs from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const hasLocalFiles = fs.existsSync(path.resolve(__dirname, "../template-files"))

const root_path_core =
  hasLocalFiles && !process?.argv?.[1]?.includes("copy-src")
    ? path.resolve(__dirname, "../template-files")
    : path.resolve(__dirname, "../../../packages/core/src")

const root_path_hooks =
  hasLocalFiles && !process?.argv?.[1]?.includes("copy-src")
    ? path.resolve(__dirname, "../template-files")
    : path.resolve(__dirname, "../../../packages/hooks/src")


export const everything = {
  core: {
    name: "core",
    dependencies: [
      "openai",
      "zod",
      "zod-to-json-schema",
      "@streamparser/json",
      "eventsource-parser"
    ],
    dirs: ["utils", "ai/agents", "ai/fns"],
    files: [
      {
        name: "agent creators",
        targetPath: `ai/agents`,
        fileName: "index.ts",
        srcPath: `${root_path_core}/ai/agents/index.ts`
      },
      {
        name: "OAI utils",
        targetPath: `utils`,
        fileName: "oai.ts",
        srcPath: `${root_path_core}/utils/oai.ts`
      },
      {
        name: "OAI stream util",
        targetPath: `utils`,
        fileName: "oai-stream.ts",
        srcPath: `${root_path_core}/utils/oai-stream.ts`
      },
      {
        name: "OAI fns",
        targetPath: `ai/fns`,
        fileName: "index.ts",
        srcPath: `${root_path_core}/ai/fns/index.ts`
      },
      {
        name: "OAI Schema FN",
        targetPath: `ai/fns`,
        fileName: "schema.ts",
        srcPath: `${root_path_core}/ai/fns/schema.ts`
      }
    ]
  },
  hooks: {
    name: "hooks",
    dependencies: ["zod", "ramda", "@streamparser/json"],
    dirs: ["hooks", "utils"],
    files: [
      {
        name: "use-chat-stream",
        targetPath: `hooks`,
        fileName: "use-chat-stream.ts",
        srcPath: `${root_path_hooks}/hooks/use-chat-stream.ts`
      },
      {
        name: "use-json-stream",
        targetPath: `hooks`,
        fileName: "use-json-stream.ts",
        srcPath: `${root_path_hooks}/hooks/use-json-stream.ts`
      },
      {
        name: "streaming-json-parser",
        targetPath: `utils`,
        fileName: "streaming-json-parser.ts",
        srcPath: `${root_path_hooks}/utils/streaming-json-parser.ts`
      }
    ]
  }
}
