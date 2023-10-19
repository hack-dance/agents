import { useCallback, useRef, useState } from "react"

import { UseStreamProps, useStream } from "./use-stream"

type Messages = {
  role: string
  content: string
}[]

type OnEndArgs = {
  content?: string
  messagePair?: Messages
  messages?: Messages
}

interface StartStreamArgs {
  url: string
  prompt: string
  /**
   * @deprecated This property is deprecated and will be removed in future versions. Use body instead.
   */
  ctx?: object
  body?: object
  headers?: Record<string, string>
  method?: "GET" | "POST"
}

interface StartStream {
  (args: StartStreamArgs): void
}

interface StopStream {
  (): void
}

export interface UseChatStreamPayload {
  loading: boolean
  startStream: StartStream
  stopStream: StopStream
  messages: Messages
  setMessages: (messages: Messages) => void
}

export interface UseChatStreamProps extends UseStreamProps {
  onReceive?: (value: string) => void
  onEnd?: (args: OnEndArgs) => void
  startingMessages?: Messages
  ctx?: object
  defaultHeaders?: Record<string, string>
  defaultMethod?: "GET" | "POST"
}

/**
 * `useChatStream` is a custom React hook that extends the `useStream` hook to manage a chat stream.
 * It provides functionalities to start and stop the chat stream, manage the chat messages, and manage the loading state.
 *
 * @param {UseChatStreamProps} props - The props for the hook include optional callback
 * functions that will be invoked at different stages of the chat stream lifecycle, and a list of starting messages.
 *
 * @returns {UseChatStreamPayload} - An object that includes the loading state, start and stop stream functions,
 * current messages, and a function to set messages.
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
  onReceive,
  onEnd,
  startingMessages = [],
  ctx = {},
  defaultHeaders,
  defaultMethod = "POST",
  ...streamProps
}: UseChatStreamProps): UseChatStreamPayload {
  const [manualRenders, setManualRenders] = useState(0)
  const [loading, setLoading] = useState(false)
  const [_currentStream, setCurrentStream] = useState("")

  const messagesRef = useRef<Messages>(startingMessages)

  /**
   * @function setMessages
   * Replaces the current chat messages.
   *
   * @param {Messages} messages - The new chat messages.
   *
   * @example
   * ```
   * setMessages([{ role: 'user', content: 'Hello, world!' }]);
   * ```
   */
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

  const { startStream: startStreamBase, stopStream } = useStream({
    ...streamProps
  })

  /**
   * @function startStream
   * Starts a chat stream with the provided arguments.
   *
   * @param {StartStreamArgs} args - The arguments for starting the chat stream, including the URL, prompt, and optional context.
   *
   * @example
   * ```
   * startStream({ url: 'http://example.com', prompt: 'Hello, world!', ctx: { key: 'value' } });
   * ```
   */
  const startStream = async ({
    url,
    prompt,
    ctx: completionCtx = {},
    body = {},
    headers = {},
    method
  }: StartStreamArgs) => {
    try {
      const userMessage = {
        content: prompt,
        role: "user"
      }

      const newMessages = [...messagesRef?.current, userMessage] as Messages

      setLoading(true)
      setMessages(newMessages)

      const response = await startStreamBase({
        url,
        method: method ?? defaultMethod ?? "POST",
        headers: {
          ...defaultHeaders,
          ...headers
        },
        body: {
          ...body,
          prompt,
          ctx: {
            messages: messagesRef.current,
            ...ctx,
            ...completionCtx
          }
        }
      })

      let done = false
      const data = response.body

      if (!data) {
        return
      }

      const reader = data.getReader()

      let result = ""
      const decoder = new TextDecoder()

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading

        const chunkValue = decoder.decode(value)
        result += chunkValue

        onReceive && onReceive(chunkValue)
        setMessages([...newMessages, { role: "assistant", content: result }])
        setCurrentStream(result)

        if (done) {
          onEnd &&
            onEnd({
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
      }
    } catch (err) {
      if (err?.name === "AbortError") {
        console.log("aborted", err)
        return null
      }
      console.error(`error in chat stream hook`, err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    startStream,
    stopStream,
    messages: messagesRef.current,
    setMessages: manualSetMessages
  }
}
