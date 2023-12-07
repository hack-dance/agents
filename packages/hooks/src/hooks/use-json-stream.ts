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

type SchemaType = z.AnyZodObject

export interface UseJsonStreamProps extends UseStreamProps {
  onReceive?: (data) => void
  onEnd?: (data) => void
  schema: SchemaType
  defaultHeaders?: Record<string, string>
  defaultMethod?: "GET" | "POST"
  ctx?: object
  defaultData?: object | null
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

export function useJsonStream({
  onReceive,
  onEnd,
  schema,
  defaultData = null,
  ctx = {},
  defaultHeaders,
  defaultMethod = "POST",
  ...streamProps
}: UseJsonStreamProps): {
  startStream: StartStream
  stopStream: StopStream
  json
  loading: boolean
  completedKeys: string[]
  activeKey: string | undefined
} {
  const [completedKeys, setCompletedKeys] = useState<string[]>([])
  const [activeKey, setActiveKey] = useState<string | undefined>(undefined)

  const streamParser = new SchemaStream(schema, {
    defaultData,
    onKeyComplete: ({ activeKey, completedKeys }) => {
      console.log(activeKey, completedKeys)
      setActiveKey(activeKey)
      setCompletedKeys(completedKeys)
    }
  })
  const stubbedValue = streamParser.getSchemaStub(schema, defaultData)

  const [loading, setLoading] = useState(false)
  const { startStream: startStreamBase, stopStream } = useStream(streamProps)
  const [json, setJson] = useState(stubbedValue)
  const jsonRef = useRef(json)

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
    const parser = streamParser.parse({
      stringStreaming: true
    })

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
      response.body.pipeThrough(parser)

      const reader = parser.readable.getReader()
      const decoder = new TextDecoder()

      let done = false
      while (!done) {
        try {
          const { value, done: doneReading } = await reader.read()
          done = doneReading

          if (done) {
            onEnd && onEnd(jsonRef.current as z.infer<typeof schema>)
            setLoading(false)
            setCompletedKeys([])
            setActiveKey(undefined)
            break
          }

          const chunkValue = decoder.decode(value)
          const result = JSON.parse(chunkValue) as z.infer<typeof schema>

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

          stopStream()
          setCompletedKeys([])
          setActiveKey(undefined)
          console.error(`useJsonStream: error`, err)
          throw err
        }
      }
    }
  }

  return {
    startStream,
    stopStream,
    completedKeys,
    activeKey,
    json,
    loading
  }
}
