import Link from "next/link"

export default async function DocLayout({ children }) {
  return (
    <div className="w-full h-full flex">
      <div className="w-[380px] h-full border-r-2 border-accent">
        <div className="p-4">
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Getting started</h4>

          <div className="grid grid-flow-row auto-rows-max text-sm">
            <Link
              className="font-medium text-muted-foreground group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline"
              href="/docs/getting-started/installation"
            >
              Intro
            </Link>
            <Link
              className="font-medium text-muted-foreground group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline"
              href="/docs/getting-started/installation"
            >
              Install
            </Link>
          </div>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Agents</h4>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Functions</h4>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Hooks</h4>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Utilities</h4>
        </div>
      </div>
      <div className="w-full h-full">{children}</div>
    </div>
  )
}
