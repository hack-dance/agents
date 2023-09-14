import fs from "fs"
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hasLocalFiles = fs.existsSync(path.resolve(__dirname, "../template-files"))
const root_path = hasLocalFiles && !process?.argv?.[1]?.includes("copy-src")
  ? path.resolve(__dirname, "../template-files")
  : path.resolve(__dirname, "../../../packages/core/src/")

export const everything = {
  core: {
    name: "core",
    dependencies: ["openai", "zod", "zod-to-json-schema"],
    dirs: ["utils", "ai/agents", "ai/fns"],
    files: [{
      name: "agent creators",
      targetPath: `ai/agents`,
      fileName: "index.ts",
      srcPath: `${root_path}/ai/agents/index.ts`,
    },{
      name: "OAI utils",
      targetPath: `utils`,
      fileName: "oai.ts",
      srcPath: `${root_path}/utils/oai.ts`,
    },{
      name: "OAI stream util",
      targetPath: `utils`,
      fileName: "oai-stream.ts",
      srcPath: `${root_path}/utils/oai-stream.ts`,
    },{
      name: "OAI fns",
      targetPath: `ai/fns`,
      fileName: "index.ts",
      srcPath: `${root_path}/ai/fns/index.ts`,
    },{
      name: "OAI Schema FN",
      targetPath: `ai/fns`,
      fileName: "schema.ts",
      srcPath: `${root_path}/ai/fns/schema.ts`,
    }]
  }
}
