import { DocNav } from "@/components/doc-nav"

export default async function DocLayout({ children }) {
  return (
    <div className="flex lg:container">
      <aside className="pl-4 pt-8 min-w-[220px] h-full lg:sticky lg:top-0 hidden lg:block">
        <DocNav />
      </aside>

      <div className="w-full flex-grow pl-2 border-l-[1px] border-accent">{children}</div>
    </div>
  )
}
