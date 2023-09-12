import "@/styles/globals.css"
import { ReactNode } from "react"
import { Metadata } from "next"
import Link from "next/link"
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons"

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
  metadataBase: new URL("https://st.co"),
  themeColor: "#ffffff"
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div
            className={cn(
              defaultFontMapper.default,
              defaultFontMapper.serif,
              defaultFontMapper.mono,
              defaultFontMapper.outline,
              defaultFontMapper.blunt,
              "flex-col items-stretch h-screen w-screen"
            )}
          >
            <header className="w-full p-4 border-b-[1px] border-accent flex justify-between items-center">
              <div className="flex items-center gap-6">
                <h1 className="font-blunt text-sm ">
                  <Link href="/" className="flex items-center gap-2">
                    <span className="text-3xl leading-none tracking-tight">×</span>Hack-dance/Agents
                  </Link>
                </h1>

                <nav className="space-x-4">
                  {siteConfig.mainNav.map(({ label, url }) => (
                    <Link
                      className="text-sm leading-loose text-muted-foreground hover:text-foreground"
                      href={url}
                      key={label}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex gap-4 items-center">
                <Link href="/getting-started">
                  <GitHubLogoIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Link>
                <Link href="/getting-started">
                  <TwitterLogoIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Link>
              </div>
            </header>

            <main className="flex-1 h-full w-full">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
