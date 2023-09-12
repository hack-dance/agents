"use client"

import { useState } from "react"
import { Messages, useJsonStream } from "@hack-dance/agents-hooks"
import { z } from "zod"

import { delegateAgentSchema, delegates } from "@/ai/agents/delegate-example-agent"

type DelegatePromiseResult = {
  name: string
  contextForCore: boolean
  data: unknown
}

async function delegatePromise(agent, prompt, ctx) {
  const { url, name, parser, contextForCore = false } = agent
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      ctx
    })
  })
    .then(response => response.json())
    .then(data => ({
      name,
      contextForCore,
      data: parser(data)
    }))
}

async function processDelegations(
  delegations: Record<string, string[]>,
  ctx: object,
  onReceiveDelegateResponses: (results: DelegatePromiseResult[]) => void
): Promise<void> {
  const delegatePromises: Promise<DelegatePromiseResult>[] = []
  const results: DelegatePromiseResult[] = [] // Array to keep track of processed responses

  Object.keys(delegations).forEach(key => {
    const prompts = delegations[key]
    const delegate = delegates[key]
    if (!delegate || !prompts?.length) return

    const { url, parser, contextForCore } = delegate

    prompts.forEach(prompt => {
      const promise = delegatePromise({ name: key, url, parser, contextForCore }, prompt, ctx)
      delegatePromises.push(promise)
    })
  })

  await Promise.all(
    delegatePromises.map(async (promise, index) => {
      try {
        const result = await promise
        results[index] = result
        onReceiveDelegateResponses(results.filter(r => r !== undefined))
      } catch (error) {
        console.error(error)
      }
    })
  )
}

export function RealtimeBot({ onReceiveDelegateResponses }) {
  const [_retreivingContextFromAgent, setRetreivingContextFromAgent] = useState(false)
  const [latestPrompt, setLatestPrompt] = useState("")
  const [messages, setMessages] = useState<Messages>([])

  const { startStream, loading } = useJsonStream({
    messages,
    onReceive: ({ content }) => {
      console.log(content)
    },
    onEnd: async ({ content }) => {
      const data = content as z.infer<typeof delegateAgentSchema>

      setMessages([
        ...messages,
        {
          content: latestPrompt,
          role: "user"
        },
        {
          content: data.content,
          role: "user"
        }
      ])

      await processDelegations(
        JSON.parse(data.delegates),
        {
          //optional context
        },
        onReceiveDelegateResponses
      )
    },
    schema: delegateAgentSchema
  })

  return (
    <div className="relative h-full flex-col justify-center flex items-center">
      {loading && <div>Loading...</div>}

      <div
        onClick={() => {
          setRetreivingContextFromAgent(false)
          startStream({
            url: "/api/ai/bots/realtime",
            prompt: "return from callback probably",
            ctx: {}
          })
        }}
      >
        Put input mechanism here
      </div>
    </div>
  )
}
