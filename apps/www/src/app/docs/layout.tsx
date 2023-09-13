import { DocNav } from "@/components/doc-nav"

export default async function DocLayout({ children }) {
  return (
    <div className="flex lg:container pt-[64px] min-h-screen">
      <aside className="top-[64px] pl-4 pt-6 min-w-[220px] h-full lg:sticky hidden lg:block">
        <DocNav />
      </aside>

      <div className="w-full flex-grow pl-2 border-l-[1px] border-accent min-h-full">
        {children}
      </div>
    </div>
  )
}
