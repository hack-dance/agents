"use client"

import { useState } from "react"
import { useChatStream } from "@hackdance/hooks"

import { FloatingChat } from "@/components/floating-chat"
import { PromptComposer } from "@/components/prompt-composer"

export function Chat() {
  const [prompt, setPrompt] = useState("")
  const [loading, setIsLoading] = useState(false)

  const { startStream, messages } = useChatStream({
    startingMessages: []
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
    <div className="">
      <h1>Chat</h1>

      <FloatingChat messages={messages} />

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
