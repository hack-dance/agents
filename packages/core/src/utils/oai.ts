import OpenAI from "openai"
import { Stream } from "openai/streaming"

import { FunctionDefinitionInterface } from "@/ai/fns"

/**
 * This function executes a function from a response. It parses the response, finds the corresponding function definition,
 * and executes it with the parsed arguments.
 * @param {OpenAI.Chat.Completions.ChatCompletion} resp - The response from the function call.
 * @param {Array<FunctionDefinitionInterface>} functionDefinitions - An array of function definitions.
 * @returns {any|null} - The result of the function execution, or null if an error occurs.
 */
export function executeFunctionFromResponse(
  resp: OpenAI.Chat.Completions.ChatCompletion,
  functionDefinitions: Array<FunctionDefinitionInterface>
) {
  try {
    const parsedResponse = OAIResponseFnArgsParser(resp)

    if (parsedResponse) {
      const { functionName, args } = parsedResponse

      for (const functionDefinition of functionDefinitions) {
        const { run, definition } = functionDefinition

        if (run && functionName === definition.name) {
          return run(args)
        }
      }
    }

    return null
  } catch (err) {
    console.error("Error executing function", err)
    return null
  }
}

/**
 * `OAIResponseTextParser` parses a JSON string and extracts the text content.
 *
 * @param {string} data - The JSON string to parse.
 * @returns {string} - The extracted text content.
 *
 */
export function OAIResponseTextParser(
  data:
    | string
    | Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
    | OpenAI.Chat.Completions.ChatCompletion
) {
  const parsedData = typeof data === "string" ? JSON.parse(data) : data
  const text =
    parsedData.choices?.[0].delta?.content ?? parsedData?.choices[0]?.message?.content ?? ""

  return text
}

/**
 * `OAIResponseFnArgsParser` parses a JSON string and extracts the function call arguments.
 *
 * @param {string} data - The JSON string to parse.
 * @returns {Object} - The extracted function call arguments.
 *
 */
export function OAIResponseFnArgsParser(
  data:
    | string
    | Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
    | OpenAI.Chat.Completions.ChatCompletion
) {
  const parsedData = typeof data === "string" ? JSON.parse(data) : data

  const text =
    parsedData.choices?.[0]?.delta?.function_call?.arguments ??
    parsedData.choices?.[0]?.message?.function_call?.arguments ??
    null

  return text
}

/**
 * `OAIResponseToolArgsParser` parses a JSON string and extracts the tool call arguments.
 *
 * @param {string} data - The JSON string to parse.
 * @returns {Object} - The extracted tool call arguments.
 *
 */
export function OAIResponseToolArgsParser(
  data:
    | string
    | Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
    | OpenAI.Chat.Completions.ChatCompletion
) {
  const parsedData = typeof data === "string" ? JSON.parse(data) : data

  const text =
    parsedData.choices?.[0].delta?.tool_calls?.[0]?.function?.arguments ??
    parsedData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ??
    null

  return text
}

/**
 * `OAIResponseParser` parses a JSON string or a response object.
 * It checks if the input contains function call arguments. If it does,
 * it uses `OAIResponseFnArgsParser` to parse the input, otherwise, it uses `OAIResponseTextParser`.
 *
 * @param {string | Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | OpenAI.Chat.Completions.ChatCompletion} data - The input to parse.
 * @returns {T} - The result of the appropriate parser.
 */

export function OAIResponseParser<T>(
  data:
    | string
    | Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
    | OpenAI.Chat.Completions.ChatCompletion
): T {
  const parsedData = typeof data === "string" ? JSON.parse(data) : data

  const isFnCall =
    parsedData.choices?.[0]?.delta?.function_call?.arguments ||
    parsedData.choices?.[0]?.message?.function_call?.arguments ||
    false

  const isToolCall =
    parsedData.choices?.[0].delta?.tool_calls?.[0]?.function?.arguments ??
    parsedData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ??
    false

  if (isFnCall) {
    return OAIResponseFnArgsParser(data)
  }

  if (isToolCall) {
    return OAIResponseToolArgsParser(data)
  }

  return OAIResponseTextParser(data)
}
