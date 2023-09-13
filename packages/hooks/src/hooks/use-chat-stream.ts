import { useCallback, useEffect, useRef, useState } from "react"
import OpenAI from "openai"

export type Messages = OpenAI.Chat.ChatCompletionMessageParam[]

export type OnEndArgs = {
  createdAt: string
  content?: string
  messagePair?: Messages
  messages?: Messages
}

export interface StartStreamArgs {
  url: string
  prompt: string
  ctx?: object
}

export interface StartStream {
  (args: StartStreamArgs): void
}

export interface StopStream {
  (): void
}

export interface UseChatStreamPayload {
  loading: boolean
  startStream: StartStream
  stopStream: StopStream
  messages: Messages
  setMessages: (messages: Messages) => void
}

export interface UseChatStreamProps {
  onBeforeStart?: () => void
  onReceive?: (value: string) => void
  onEnd?: (args: OnEndArgs) => void
  startingMessages?: Messages
  ctx?: object
}

/**
 * @param {UseChatStreamProps} props
 *
 * @returns {UseChatStreamPayload}
 *
 */
export function useChat({
  onBeforeStart,
  onReceive,
  onEnd,
  startingMessages = [],
  ctx = {}
}: UseChatStreamProps): UseChatStreamPayload {
  const [manualRenders, setManualRenders] = useState(0)
  const [loading, setLoading] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<Messages>(startingMessages)

  const setMessages = useCallback((messages: Messages) => {
    messagesRef.current = messages
  }, [])

  const manualSetMessages = useCallback(
    (messages: Messages) => {
      messagesRef.current = messages

      setManualRenders(manualRenders + 1)
    },
    [manualRenders]
  )

  const startStream = async ({ url, prompt, ctx: completionCtx = {} }) => {
    try {
      const userMessage = {
        content: prompt,
        role: "user"
      }

      const newMessages = [...messagesRef?.current, userMessage] as Messages

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setLoading(true)
      setMessages(newMessages)
      onBeforeStart && onBeforeStart()

      const response = await fetch(`${url}`, {
        method: "POST",
        signal: abortController.signal,
        body: JSON.stringify({
          prompt,
          ctx: {
            ...ctx,
            ...completionCtx
          }
        })
      })

      if (!response.ok) {
        throw new Error(response.statusText)
      }

      let done = false
      const data = response.body

      if (!data) {
        return
      }

      const reader = data.getReader()

      let result = ""
      const decoder = new TextDecoder()
      const createdAt = new Date().toISOString()

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading

        if (done) {
          onEnd &&
            onEnd({
              createdAt,
              content: result,
              messages: messagesRef.current,
              messagePair: [
                userMessage,
                {
                  role: "assistant",
                  content: result
                }
              ] as Messages
            })

          setLoading(false)
          break
        }

        const chunkValue = decoder.decode(value)
        result += chunkValue

        onReceive && onReceive(chunkValue)
        setMessages([...newMessages, { role: "assistant", content: result }])

        if (done) {
          onEnd &&
            onEnd({
              createdAt,
              content: result,
              messages: messagesRef.current,
              messagePair: [
                userMessage,
                {
                  role: "assistant",
                  content: result
                }
              ] as Messages
            })

          setLoading(false)

          break
        }

        if (abortControllerRef.current === null) {
          reader.cancel()
          setLoading(false)
          break
        }
      }

      abortControllerRef.current = null
    } catch (err) {
      if (err?.name === "AbortError") {
        console.log("aborted", err)
        abortControllerRef.current = null
        return null
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef?.current?.abort()
      abortControllerRef.current = null
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  return {
    loading,
    startStream,
    stopStream,
    messages: messagesRef.current,
    setMessages: manualSetMessages
  }
}
