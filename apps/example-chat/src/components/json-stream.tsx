"use client"

import { useRef, useState } from "react"
import { useChatStream, useJsonStream } from "@hackdance/hooks"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"

import { schema } from "@/ai/agents/schema"

import { Button } from "./ui/button"

export function JsonStream() {
  const [prompt, setPrompt] = useState("")
  const [message, setMessage] = useState<string | undefined>(undefined)
  const streamedMessage = useRef("")

  const { startStream, stopStream, json } = useJsonStream({
    schema: schema
  })

  const {
    startStream: chatStart,
    loading,
    stopStream: chatStop
  } = useChatStream({
    onReceive: message => {
      streamedMessage.current += message
      setMessage(streamedMessage.current)
    }
  })

  const sendMessage = async () => {
    if (loading) return

    setPrompt("")

    try {
      startStream({
        prompt,
        url: "/api/ai/json"
      })

      chatStart({
        prompt,
        url: "/api/ai/json"
      })
    } catch (e) {
      console.log(e)
    }
  }

  const jsonLog = "```json \n" + JSON.stringify(json, null, 2) + " \n```"

  return (
    <div className="flex flex-col max-h-full w-full">
      <div className="gap-4 flex justify-center">
        <div className="max-h-full overflow-x-auto flex-1 w-[50%]">
          <ReactMarkdown
            linkTarget="_blank"
            rehypePlugins={[[rehypeHighlight, {}]]}
            className={
              "react-markdown-message prose prose-invert max-w-full mb-6 px-2 border-2 border-accent rounded py-2"
            }
          >
            {"```typescript \n const namesList = jsonStream?.listOfRandomNames\n```\n" +
              `${
                "```typescript \n " + JSON.stringify(json?.listOfRandomNames, null, 2) + "\n```"
              }` +
              "\n\n```typescript \n const randomThought = jsonStream?.aRandomThought\n```\n" +
              `${
                "\n```typescript \n " +
                (json?.aRandomThought?.length > 0 ? json?.aRandomThought : `""`) +
                "\n```"
              }`}
          </ReactMarkdown>

          <ReactMarkdown
            linkTarget="_blank"
            rehypePlugins={[[rehypeHighlight, {}]]}
            className={
              "react-markdown-message prose prose-invert max-h-[400px] rounded text-[#00b269] max-w-full bg-foreground px-12 py-8 overflow-auto"
            }
          >
            {jsonLog}
          </ReactMarkdown>
        </div>

        <div className="max-h-full overflow-auto flex-1 w-[50%]">
          <ReactMarkdown
            linkTarget="_blank"
            rehypePlugins={[[rehypeHighlight, {}]]}
            className={
              "react-markdown-message prose prose-invert max-w-full mb-6 px-2 border-2 border-accent rounded py-2"
            }
          >
            {"```typescript \n const namesList = jsonStream?.listOfRandomNames\n```\n" +
              `${
                "```typescript \n " +
                (message?.length && !loading
                  ? JSON.stringify(JSON.parse(message)?.listOfRandomNames, null, 2)
                  : "undefined") +
                "\n```"
              }` +
              "\n\n```typescript \n const randomThought = jsonStream?.aRandomThought\n```\n" +
              `${
                "```typescript \n " +
                (message?.length && !loading
                  ? JSON.stringify(JSON.parse(message)?.aRandomThought, null, 2)
                  : "undefined") +
                "\n```"
              }`}
          </ReactMarkdown>

          <ReactMarkdown
            linkTarget="_blank"
            rehypePlugins={[[rehypeHighlight, {}]]}
            className={
              "react-markdown-message prose prose-invert max-h-[400px] rounded text-[#00b269] max-w-full bg-foreground px-12 py-8 overflow-auto"
            }
          >
            {"```bash \n" + message ?? "undefined" + "\n```"}
          </ReactMarkdown>
        </div>
      </div>

      <div className="gap-4 flex justify-start mt-8">
        <Button onClick={sendMessage} disabled={loading}>
          Start stream
        </Button>

        <Button
          onClick={() => {
            chatStop()
            stopStream()
          }}
          disabled={loading}
        >
          Stop stream
        </Button>
      </div>
    </div>
  )
}
