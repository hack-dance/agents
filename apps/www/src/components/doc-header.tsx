import Link from "next/link"
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons"

import { siteConfig } from "@/config/site"
import { MobileNav } from "@/components/mobile-nav"
import ModeToggle from "@/components/mode-toggle"

export function DocHeader({ packageConfig }) {
  return (
    <>
      <header className="absolute top-0 z-10 w-full p-4 border-b-[1px] border-accent h-[64px] backdrop-blur-md bg-background/90 dark:bg-background/50">
        <div className="lg:container flex justify-between items-center">
          <div className="flex items-center lg:gap-6 gap-2">
            <div className="block lg:hidden">
              <MobileNav />
            </div>
            <h1 className="font-blunt text-sm overflow-hidden whitespace-nowrap">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-3xl leading-none tracking-tight">×</span>
                hack-dance/{packageConfig?.title ?? "oss"}
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
    </>
  )
}
