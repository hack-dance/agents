import { promises as fs } from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from "url"

import { everything } from "../src/src-files"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  const allFiles = Object.values(everything).flatMap(component => component.files)
  const uniqueFiles = Array.from(new Set(allFiles))

  await fs.rmdir(path.resolve(__dirname, "..", "template-files"), { recursive: true })
  await fs.mkdir(path.resolve(__dirname, "..", "template-files"), { recursive: true })

  for await (const file of uniqueFiles) {
    await fs.mkdir(path.resolve(__dirname, "..", "template-files", file.targetPath), {
      recursive: true
    })
    await fs.copyFile(
      file.srcPath,
      path.resolve(__dirname, "..", "template-files", file.targetPath, file.fileName)
    )
  }
}

main()
