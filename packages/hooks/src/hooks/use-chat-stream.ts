import { useCallback, useEffect, useRef, useState } from "react"
import OpenAI from "openai"

export type OnEndArgs = {
  createdAt: number
  content?: string
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

export type Messages = OpenAI.Chat.ChatCompletionMessageParam[]

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
}

/**
 * `useChatStream` is a custom React hook that enables real-time chat functionalities.
 * It manages a chat stream, including starting a chat stream, stopping it, and handling
 * incoming chat messages. It also provides a loading state indicator.
 *
 * @param {UseChatStreamProps} props - The props for the hook include optional callback
 * functions that will be invoked at different stages of the chat stream lifecycle,
 * and a list of starting messages.
 *
 * @returns {UseChatStreamPayload} - An object that includes the loading state, start and
 * stop stream functions, current messages, and a function to set messages.
 *
 * @example
 * ```
 * const {
 *   loading,
 *   startStream,
 *   stopStream,
 *   messages,
 *   setMessages
 * } = useChatStream({ onBeforeStart: ..., onReceive: ..., onEnd: ..., startingMessages: ... });
 * ```
 */
export function useChatStream({
  onBeforeStart,
  onReceive,
  onEnd,
  startingMessages = []
}: UseChatStreamProps): UseChatStreamPayload {
  const [loading, setLoading] = useState(false)
  const [_currentStream, setCurrentStream] = useState("")

  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<Messages>(startingMessages)

  const setMessages = useCallback((messages: Messages) => {
    messagesRef.current = messages
  }, [])

  const startStream = async ({ url, prompt, ctx = {} }) => {
    try {
      const newMessages = [
        ...messagesRef?.current,
        {
          content: prompt,
          role: "user"
        }
      ] as Messages

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
          messages: messagesRef?.current,
          ctx
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
      const createdAt = new Date().valueOf()

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (done) {
          onEnd &&
            onEnd({
              createdAt,
              content: result
            })
          setLoading(false)
          break
        }

        const chunkValue = decoder.decode(value)
        result += chunkValue

        onReceive && onReceive(chunkValue)
        setMessages([...newMessages, { role: "assistant", content: result }])
        setCurrentStream(result)

        done &&
          onEnd &&
          onEnd({
            createdAt,
            content: result
          })
        done && setLoading(false)

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
    setMessages
  }
}
