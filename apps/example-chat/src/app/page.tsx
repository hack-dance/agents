import { JsonStream } from "@/components/json-stream"

export default async function Page() {
  return (
    <div className="flex justify-center items-center h-full flex-1 w-full flex-col">
      {/* <h1 className="text-4xl font-blunt">Json stream</h1> */}
      <div className="flex gap-2 justify-center items-center mt-8 container max-h-[70vh] overflow-hidden">
        <JsonStream />
      </div>
    </div>
  )
}
