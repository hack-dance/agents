import "@/styles/globals.css"
import { ReactNode } from "react"
import { Metadata } from "next"
import { Analytics } from "@vercel/analytics/react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { defaultFontMapper } from "@/styles/fonts"

import Providers from "./providers"

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.og.title,
    description: siteConfig.og.description,
    images: []
  },
  metadataBase: new URL(siteConfig.url),
  themeColor: "#ffffff"
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          defaultFontMapper.default,
          defaultFontMapper.serif,
          defaultFontMapper.mono,
          defaultFontMapper.outline,
          defaultFontMapper.blunt
        )}
      >
        <Providers>
          <div className={cn("flex-col h-screen w-screen overflow-hidden relative")}>
            {children}
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
