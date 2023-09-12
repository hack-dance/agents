import Link from "next/link"

import { docs } from "@/config/docs"
import { ScrollArea } from "@/components/ui/scroll-area"

export default async function DocLayout({ children }) {
  return (
    <div className="w-full h-full flex">
      <aside className="w-[320px] h-full border-r-[1px] border-accent md:sticky hidden md:block">
        <ScrollArea className="h-full">
          <div className="py-10 pl-8">
            {docs.map((docSection, index) => (
              <div key={index}>
                <div className="grid grid-flow-row auto-rows-max text-sm mb-2">
                  {docSection.map(doc => (
                    <div key={doc.title}>
                      {doc?.titlePage ? (
                        <h4 className="mb-1 rounded-md px-2 text-sm font-semibold">
                          <Link className="hover:underline" href={`/docs/${doc.slug}`}>
                            {doc.title}
                          </Link>
                        </h4>
                      ) : (
                        <Link
                          className="font-medium text-muted-foreground group flex w-full items-center rounded-md border border-transparent px-3 py-1 hover:underline"
                          href={`/docs/${doc.slug}`}
                        >
                          {doc.title}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
      <div className="w-full h-full">{children}</div>
    </div>
  )
}
