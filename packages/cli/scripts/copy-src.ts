import { everything } from "../src/src-files"
import { promises as fs } from "fs"
import path from "path"

async function main() {
  const allFiles = Object.values(everything).flatMap((component) => component.files)
  const uniqueFiles = Array.from(new Set(allFiles))

  await fs.rmdir(path.resolve(__dirname, "..", "template-files"), { recursive: true })
  await fs.mkdir(path.resolve(__dirname, "..", "template-files"), { recursive: true })

  for await (const file of uniqueFiles) {
    await fs.mkdir(path.resolve(__dirname, "..", "template-files", file.targetPath), { recursive: true })
    await fs.copyFile(file.srcPath, path.resolve(__dirname, "..", "template-files", file.targetPath, file.fileName))
  }
}

main()
