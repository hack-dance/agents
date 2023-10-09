"use client"

import { useState } from "react"
import { useJsonStream } from "@hackdance/agents-hooks"

import { PromptComposer } from "@/components/prompt-composer"
import { schema } from "@/ai/agents/schema"

export function Chat() {
  const [prompt, setPrompt] = useState("")
  const [loading, setIsLoading] = useState(false)

  const { startStream, json } = useJsonStream({
    schema: schema,
    onEnd: resp => {
      console.log("onEnd", resp)
    }
  })

  const sendMessage = async () => {
    if (!prompt.length || loading) return

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

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPrompt(event.target.value ?? "")
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault() // Prevent the default newline behavior of the Enter key
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col max-h-full">
      <div className="max-h-full overflow-y-auto flex-1 px-12 py-8">
        {`
          json: ${JSON.stringify(json, null, 2)}
        `}
      </div>

      <PromptComposer
        loading={loading}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onSubmit={sendMessage}
        prompt={prompt}
      />
    </div>
  )
}
