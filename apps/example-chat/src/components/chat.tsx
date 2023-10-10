"use client"

import { useState } from "react"
import { useJsonStream } from "@hackdance/agents-hooks"

import { schema } from "@/ai/agents/schema"

import { Button } from "./ui/button"

export function Chat() {
  const [prompt, setPrompt] = useState("")
  const [loading, setIsLoading] = useState(false)

  const { startStream, stopStream, json } = useJsonStream({
    schema: schema
  })

  const sendMessage = async () => {
    if (loading) return

    setIsLoading(true)
    setPrompt("")

    try {
      startStream({
        prompt,
        url: "/api/ai/chat"
      })
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col max-h-full">
      <pre className="max-h-full overflow-y-auto flex-1 px-12 py-8">
        {`
          ${JSON.stringify(json, null, 2)}
        `}
      </pre>

      <div className="gap-4 flex justify-center">
        <Button onClick={sendMessage} disabled={loading}>
          Start stream
        </Button>

        <Button onClick={stopStream} disabled={loading}>
          Stop stream
        </Button>
      </div>
    </div>
  )
}
