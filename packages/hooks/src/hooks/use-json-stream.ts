import { useRef, useState } from "react"
import { SchemaStream } from "schema-stream"
import z from "zod"

import { UseStreamProps, useStream } from "./use-stream"

interface StartStreamArgs {
  url: string
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

export interface UseJsonStreamProps<T extends z.ZodRawShape> extends UseStreamProps {
  onReceive?: (value: object | unknown) => void
  onEnd?: (json: object) => void
  schema: z.ZodObject<T>
  defaultHeaders?: Record<string, string>
  defaultMethod?: "GET" | "POST"
  ctx?: object
}

/**
 * `useJsonStream` is a custom React hook that extends the `useStream` hook to add JSON parsing functionality.
 * It uses the `SchemaStream` to parse the incoming stream into JSON.
 *
 * @param {UseJsonStreamProps} props - The props for the hook include optional callback
 * functions that will be invoked at different stages of the stream lifecycle, and a schema for the JSON data.
 *
 * @returns {Object} - An object that includes the loading state, start and stop stream functions, and the parsed JSON data.
 *
 * @example
 * ```
 * const {
 *   loading,
 *   startStream,
 *   stopStream,
 *   json
 * } = useJsonStream({ onBeforeStart: ..., onReceive: ..., onStop: ..., schema: ... });
 * ```
 */
export function useJsonStream<T extends z.ZodRawShape>({
  onReceive,
  onEnd,
  schema,
  ctx = {},
  defaultHeaders,
  defaultMethod = "POST",
  ...streamProps
}: UseJsonStreamProps<T>): {
  startStream: StartStream
  stopStream: StopStream
  json: z.infer<typeof schema>
  loading: boolean
} {
  const streamParser = new SchemaStream(schema)
  const stubbedValue = streamParser.getSchemaStub(schema)

  const [loading, setLoading] = useState(false)
  const { startStream: startStreamBase, stopStream } = useStream(streamProps)
  const [json, setJson] = useState<z.infer<typeof schema>>(stubbedValue)
  const jsonRef = useRef<z.infer<typeof schema>>(json)

  /**
   * @function startStream
   * Starts a stream with the provided arguments and parses the incoming stream into JSON.
   *
   * @param {StartStreamArgs} args - The arguments for starting the stream, including the URL and optional body.
   *
   * @example
   * ```
   * startStream({ url: 'http://example.com', ctx: { key: 'value' } });
   * ```
   */
  const startStream = async ({
    url,
    ctx: completionCtx = {},
    body = {},
    headers,
    method
  }: StartStreamArgs) => {
    setLoading(true)
    const response = await startStreamBase({
      url,
      method: method ?? defaultMethod ?? "POST",
      headers: {
        ...defaultHeaders,
        ...headers
      },
      body: {
        ...body,
        ctx: {
          ...ctx,
          ...completionCtx
        }
      }
    })

    if (response?.body) {
      const parser = streamParser.parse()
      response.body.pipeThrough(parser)

      const reader = parser.readable.getReader()
      const decoder = new TextDecoder()

      let done = false
      while (!done) {
        try {
          const { value, done: doneReading } = await reader.read()
          done = doneReading

          if (done) {
            onEnd && onEnd(jsonRef.current)
            setLoading(false)
            break
          }

          const chunkValue = decoder.decode(value)
          const result = JSON.parse(chunkValue)

          jsonRef.current = result
          setJson(result)
          onReceive && onReceive(result)
        } catch (err) {
          done = true
          setLoading(false)
          if (err?.name === "AbortError") {
            console.log("useJsonStream: aborted", err)
            return null
          }

          console.error(`useJsonStream: error`, err)
          throw err
        }
      }
    }
  }

  return {
    startStream,
    stopStream,
    json,
    loading
  }
}
