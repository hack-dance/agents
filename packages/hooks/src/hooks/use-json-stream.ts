import { useCallback, useEffect, useRef, useState } from "react"
import OpenAI from "openai"
import z from "zod"

import { JsonStreamParser } from "@/utils/streaming-json-parser"

type OnEndArgs = {
  createdAt: number
  content?: unknown | object
}

interface StartStreamArgs {
  url: string
  prompt: string
  ctx?: object
}

interface StartStream {
  (args: StartStreamArgs): void
}

interface StopStream {
  (): void
}

type Messages = OpenAI.Chat.ChatCompletionMessageParam[]

export interface UseJsonStreamProps {
  onBeforeStart?: () => void
  onReceive?: (value: object | unknown) => void
  onEnd?: (args: OnEndArgs) => void
  messages?: Messages
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodObject<any>
}

/**
 * `useJsonStream` is a custom React hook that enables real-time chat functionalities.
 * It manages a chat stream, including starting a chat stream, stopping it, and handling
 * incoming chat messages. It also provides a loading state indicator.
 *
 * @param {UseJsonStreamProps} props - The props for the hook include optional callback
 * functions that will be invoked at different stages of the chat stream lifecycle,
 * and a list of starting messages.
 *
 * @returns {UseJsonStreamPayload} - An object that includes the loading state, start and
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
 * } = useJsonStream({ onBeforeStart: ..., onReceive: ..., onEnd: ..., startingMessages: ... });
 * ```
 */
export function useJsonStream({
  onBeforeStart,
  onReceive,
  onEnd,
  messages = [],
  schema
}: UseJsonStreamProps): {
  loading: boolean
  startStream: StartStream
  stopStream: StopStream
  json: z.infer<typeof schema>
} {
  const [loading, setLoading] = useState(false)
  const [_currentStream, setCurrentStream] = useState({})

  const abortControllerRef = useRef<AbortController | null>(null)
  const jsonRef = useRef<object>({})

  const startStream = async ({ url, prompt, ctx = {} }) => {
    try {
      const newMessages = [
        ...messages,
        {
          content: prompt,
          role: "user"
        }
      ] as Messages

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setLoading(true)
      onBeforeStart && onBeforeStart()

      const response = await fetch(`${url}`, {
        method: "POST",
        signal: abortController.signal,
        body: JSON.stringify({
          prompt,
          messages: newMessages,
          ctx
        })
      })

      if (!response.ok) {
        console.error(`error calling stream url ${url}: ${response.statusText}`)
        throw new Error(response.statusText)
      }

      const parser = JsonStreamParser(schema)
      response.body?.pipeThrough(parser)

      let done = false
      const data = response.body

      if (!data) {
        return
      }

      const reader = parser.readable.getReader()

      let result = {}
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
        result = JSON.parse(chunkValue)

        onReceive && onReceive(result)
        jsonRef.current = result
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
      console.error(`error in chat stream hook`, err)
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
    json: jsonRef.current
  }
}
