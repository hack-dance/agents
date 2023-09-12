import fs from "fs"
import createMDX from "@next/mdx"
import rehypePrettyCode from "rehype-pretty-code"

/** @type {import('next').NextConfig} */
const nextConfig = {}

const options = {
  keepBackground: false,
  theme: JSON.parse(fs.readFileSync(new URL("./moonlight-ii.json", import.meta.url)))
}

const withMDX = createMDX({
  options: {
    extension: /\.mdx?$/,
    remarkPlugins: [],
    rehypePlugins: [[rehypePrettyCode, options]]
  }
})
export default withMDX(nextConfig)
