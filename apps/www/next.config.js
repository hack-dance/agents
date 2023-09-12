/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["three"],
  images: {
    domains: ["i.ytimg.com", "/", "image.mux.com"]
  }
}

module.exports = nextConfig
