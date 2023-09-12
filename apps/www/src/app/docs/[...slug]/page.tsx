import dynamic from "next/dynamic"
import Link from "next/link"
import { notFound } from "next/navigation"

import { docs } from "@/config/docs"

const allDocs = docs.flat()

export async function generateStaticParams() {
  return allDocs.map(doc => ({
    slug: doc.slug.split("/")
  }))
}

export default async function Page({ params: { slug } }) {
  const doc = allDocs.find(doc => doc.slug === slug.join("/"))

  if (!doc) {
    return notFound()
  }

  const Content = dynamic(() => import(`@/docs/${doc.id}.mdx`), {})

  return (
    <div className="p-4">
      <header className="border-b-[1px] border-b-accent pb-4 mb-8">
        <span className="text-sm text-muted-foreground">
          <Link href="/docs/getting-started">Documentation</Link>
        </span>
        {[...slug].slice(0, -1).map(part => {
          return (
            <>
              <span className="text-sm text-muted-foreground">{` / `}</span>
              <span
                key={part}
                className="text-sm text-muted-foreground hover:underline cursor-pointer capitalize"
              >
                <Link href={`/docs/${slug.slice(0, slug.indexOf(part) + 1).join("/")}`}>
                  {part.replace(/-/g, " ")}
                </Link>
              </span>
            </>
          )
        })}
        <span className="text-sm text-muted-foreground">{` / `}</span>
        <span className="text-sm font-semibold">{doc.title}</span>
      </header>
      <div className="px-2">
        <Content />
      </div>
    </div>
  )
}
