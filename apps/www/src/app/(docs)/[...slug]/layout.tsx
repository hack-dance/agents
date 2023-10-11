import { notFound } from "next/navigation"

import { docs } from "@/config/docs"
import { DocHeader } from "@/components/doc-header"
import { DocNav } from "@/components/doc-nav"

export default async function DocLayout({ children, params: { slug } }) {
  const parsedSlug = slug?.[0]?.split("#")[0]
  const packageConfig = docs[parsedSlug]

  if (!packageConfig) {
    return notFound()
  }

  return (
    <>
      <DocHeader packageConfig={packageConfig} />
      <div className="flex lg:container pt-[64px] h-full flex-1 w-full">
        <aside className="top-[64px] pl-4 pt-6 min-w-[220px] h-full lg:sticky hidden lg:block">
          <DocNav packageConfig={packageConfig} />
        </aside>

        <div className="w-full flex-grow pl-2 border-l-[1px] border-accent h-full max-w-full">
          <main className="h-full w-full overflow-y-auto max-w-full pb-4">{children}</main>
        </div>
      </div>
    </>
  )
}
