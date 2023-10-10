import { docs } from "@/config/docs"
import { DocHeader } from "@/components/doc-header"
import { DocNav } from "@/components/doc-nav"

export default async function DocLayout({ children, params: { slug } }) {
  const parsedSlug = slug?.[0]?.split("#")[0]
  const packageConfig = docs[parsedSlug]

  return (
    <>
      <DocHeader packageConfig={packageConfig} />
      <div className="flex lg:container pt-[64px] min-h-screen">
        <aside className="top-[64px] pl-4 pt-6 min-w-[220px] h-full lg:sticky hidden lg:block">
          <DocNav packageConfig={packageConfig} />
        </aside>

        <div className="w-full flex-grow pl-2 border-l-[1px] border-accent min-h-full">
          <main className="h-screen absolute top-0 w-full overflow-y-auto">{children}</main>
        </div>
      </div>
    </>
  )
}
