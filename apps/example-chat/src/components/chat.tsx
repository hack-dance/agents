"use client"

import { useState } from "react"
import { useChatStream } from "@hackdance/hooks"

import { FloatingChat } from "./floating-chat"
import { PromptComposer } from "./prompt-composer"

export function Chat() {
  const [prompt, setPrompt] = useState("")
  const [loading, setIsLoading] = useState(false)

  const { startStream, messages } = useChatStream({})

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
      <FloatingChat messages={messages} />
      <div className="gap-4 flex justify-center">
        <PromptComposer
          onSubmit={sendMessage}
          prompt={prompt}
          onChange={event => setPrompt(event.target.value)}
          loading={loading}
        />
      </div>
    </div>
  )
}
