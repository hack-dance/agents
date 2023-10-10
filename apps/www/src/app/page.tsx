import Link from "next/link"

export default async function Page() {
  return (
    <div className="flex justify-center items-center h-full flex-1 w-full flex-col">
      <div className="text-[80px] font-bold font-blunt">×</div>
      <div className="text-left space-y-3">
        <Link href="/agents" className="text-sm font-medium leading-none block hover:underline">
          @hack-dance/agents
        </Link>
        <Link href="/hooks" className="text-sm font-medium leading-none block hover:underline">
          @hack-dance/hooks
        </Link>
        <Link
          href="/schema-stream"
          className="text-sm font-medium leading-none block hover:underline"
        >
          schemaStream
        </Link>
      </div>
    </div>
  )
}
