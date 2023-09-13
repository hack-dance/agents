import OpenAI from "openai"
import { Stream } from "openai/streaming"

import { OAIResponseParser } from "@/utils/oai"

interface OaiStreamArgs {
  res: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
}

/**
 * `OaiStream` creates a ReadableStream that parses the SSE response from OAI
 *
 * @param {OaiStreamArgs} args - The arguments for the function.
 * @returns {ReadableStream<string>} - The created ReadableStream.
 */
export function OaiStream({ res }: OaiStreamArgs): ReadableStream<string> {
  let cancelGenerator: () => void

  async function* generateStream(res): AsyncGenerator<string> {
    cancelGenerator = () => {
      return
    }

    for await (const part of res) {
      yield OAIResponseParser(part)
    }
  }

  const generator = generateStream(res)

  return new ReadableStream({
    async start(controller) {
      for await (const parsedData of generator) {
        controller.enqueue(parsedData)
      }
      controller.close()
    },
    cancel() {
      if (cancelGenerator) {
        cancelGenerator()
      }
    }
  })
}
