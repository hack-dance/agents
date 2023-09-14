# @hackdance/agents-hooks
A collection of react hooks for building AI powered UI's.

These hooks are meant to be used with the [@hackdance/agents-core](https://agents.hack.dance) package.


## Getting Started
```bash
pnpm add @hackdance/agents-hooks
```


## use-json-stream
Hook for receiving safe to parse json from an agent stream.

**Usage**
```tsx
"use client"

import { useState } from "react"

import { useJsonStream } from "@/hooks/use-json-stream"
import { PromptComposer } from "@/components/prompt-composer"
import { jokeCriticScema } from "@/ai/agents/joke-critic-agent"

export default function JokeCritic() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState({})

  const { startStream, stopStream, loading } = useJsonStream({
    onReceive: data => {
      setResponse(data)
    },
    onEnd: async ({ content }) => {
      setResponse(content)
    },
    schema: jokeCriticScema
  })

  const sendMessage = async () => {
    if (!prompt.length || loading) return

    try {
      startStream({
        prompt,
        url: "/api/ai/joke-critic",
        ctx: {}
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPrompt(event.target.value ?? "")
  }

  return (
    <div className="h-full flex flex-col justify-between py-4 overflow-hidden">
      <div className="p-8">
        <h2>Your joke score</h2>

        <strong>Critique</strong>
        <p>{response?.critique}</p>

        <strong>Funny Factor</strong>
        <p>{response?.funnyFactor}</p>

        <strong>Novelty</strong>
        <p>{response?.novelty}</p>

        <strong>Overall Score</strong>
        <p>{response?.overallScore}</p>
      </div>

      <div className="p-8">
        <PromptComposer
          placeholder="Tell me a joke..."
          loading={loading}
          onChange={handleInput}
          onSubmit={sendMessage}
          prompt={prompt}
        />
      </div>
    </div>
  )
}
```




## Utils

**Streaming JSON parser**
utility for parsing json streams as it becomes available.

```tsx
 const functionParamaterSchema = z.object({
   name: z.string(),
   age: z.number()
 });


const functionStream = await fetch("https://api.openai.com/completion", {
  ...options,
  body: JSON.stringify({
    ...openAiConfig,
    functions: [{
      name: "My Function",
      description: "A function that returns a person's name and age.",
      paramaters: zodToJson(functionParamaterSchema)
    }]
  })
})

const argumentsStream = OAIResponseFnArgsParser(stream)
const parser = JsonStreamParser(schema);
argumentsStream?.pipeThrough(parser)
```

## use-chat-stream
A hook for managing a conversation with an ai agent.

**Usage**
```ts
"use client"

import { useState } from "react"

import { useChatStream } from "@/hooks/use-chat-stream"
import { MessageList } from "@/components/message-list"
import { PromptComposer } from "@/components/prompt-composer"

export default function Chat({ conversation, updateConversation }) {
  const [prompt, setPrompt] = useState("")
  const ChatScrollerRef = useRef<HTMLDivElement>(null)

  const scrollToEnd = ({ now = false }: { now?: boolean }) => {
    ChatScrollerRef?.current?.scrollTo({
      top: ChatScrollerRef?.current?.scrollHeight,
      behavior: now ? "auto" : "smooth"
    })
  }

  const { startStream, messages, loading } = useChatStream({
    startingMessages: conversation?.messages,
    onBeforeStart: async () => {
      scrollToEnd({})
      setPrompt("")
    },
    onEnd: ({ messagePair, messages: latestMessages }) => {
      updateConversation({ newMessages: messagePair })
    }
  })

  const sendMessage = async () => {
    if (!prompt.length || loading) return

    try {
      startStream({
        prompt,
        url: "/api/ai/chat",
        ctx: {}
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPrompt(event.target.value ?? "")
  }

  return (
    <div className="h-full flex flex-col justify-between py-4 overflow-hidden">
      <div className=" overflow-y-auto p-8" ref={ChatScrollerRef}>
        <MessageList messages={messages} />
      </div>

      <div className="p-8">
        <PromptComposer
          loading={loading}
          onChange={handleInput}
          onSubmit={sendMessage}
          prompt={prompt}
        />
      </div>
    </div>
  )
}
```
