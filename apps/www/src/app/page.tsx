import Link from "next/link"
import { GitHubLogoIcon } from "@radix-ui/react-icons"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"

export default async function Page() {
  return (
    <div className="flex justify-center items-center h-full flex-1 w-full flex-col">
      <div className="text-[80px] font-bold font-blunt">×</div>
      <h1 className="text-4xl font-blunt">Copy. Paste. AI.</h1>
      <p>A modular toolkit for building more then just chat bots.</p>
      <div className="flex gap-2 justify-center items-center mt-8">
        <Link
          href="/docs/getting-started"
          className={buttonVariants({
            variant: "default",
            size: "lg"
          })}
        >
          Get Started
        </Link>
        <Link
          href={siteConfig.links.github.url}
          target="_blank"
          className={buttonVariants({
            variant: "outline",
            size: "lg"
          })}
        >
          <GitHubLogoIcon className="h-4 w-4 mr-2" /> Github
        </Link>
      </div>
    </div>
  )
}
