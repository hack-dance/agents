import "@/styles/globals.css"
import { ReactNode } from "react"
import { Metadata } from "next"
import Link from "next/link"
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { MobileNav } from "@/components/mobile-nav"
import ModeToggle from "@/components/mode-toggle"
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
            <header className="absolute top-0 z-10 w-full p-4 border-b-[1px] border-accent h-[64px] backdrop-blur-md bg-background/90 dark:bg-background/50">
              <div className="lg:container flex justify-between items-center">
                <div className="flex items-center lg:gap-6 gap-2">
                  <div className="block lg:hidden">
                    <MobileNav />
                  </div>
                  <h1 className="font-blunt text-sm overflow-hidden whitespace-nowrap">
                    <Link href="/" className="flex items-center gap-2">
                      <span className="text-3xl leading-none tracking-tight">×</span>
                      Hack-dance/Agents
                    </Link>
                  </h1>

                  <nav className="space-x-4 hidden lg:block">
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

                <div className="gap-4 items-center hidden lg:flex">
                  <Link href={siteConfig.links.github.url} target="_blank">
                    <GitHubLogoIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Link>
                  <Link href={siteConfig.links.twitter.url} target="_blank">
                    <TwitterLogoIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Link>
                  <div className="ml-[-2px] mt-[4px]">
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </header>

            <main className="h-screen absolute top-0 w-full overflow-y-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
