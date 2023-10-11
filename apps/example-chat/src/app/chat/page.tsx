import { Chat } from "@/components/chat"

export default async function Page() {
  return (
    <div className="flex justify-center items-center h-full flex-1 w-full flex-col">
      <h1 className="text-4xl font-blunt">Json stream</h1>
      <p></p>
      <div className="flex gap-2 justify-center items-center mt-8 container max-w-3xl max-h-[70vh] overflow-hidden">
        <Chat />
      </div>
    </div>
  )
}
