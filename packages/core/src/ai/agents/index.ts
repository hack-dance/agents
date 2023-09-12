import OpenAI from "openai"
import { Stream } from "openai/streaming"
import { ZodObject } from "zod"

import { createSchemaFunction } from "@/ai/fns/schema"
import { OAIResponseParser } from "@/utils/oai"
import { OaiStream } from "@/utils/oai-stream"

/**
 * Omit the messages property from the CreateChatCompletionRequest.
 * @template T Object type to be filtered
 */

type CreateAgentConfig = Omit<OpenAI.Chat.ChatCompletionCreateParams, "messages">

export interface CreateChatAgentProps {
  config: CreateAgentConfig
  identityMessages: OpenAI.Chat.ChatCompletionMessageParam[]
}

export interface CreateSchemaAgentProps extends CreateChatAgentProps {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodObject<any>
}

export interface AgentCompletionStreamProps extends Partial<CreateChatAgentProps> {
  prompt: string
  messages?: OpenAI.Chat.ChatCompletionMessageParam[]
}

/**
 * Instance returned by the `createChatAgent` function.
 */
export interface ChatAgentInstance {
  /**
   * Creates a real-time chat stream.
   *
   * @param {AgentCompletionStreamProps} props - Properties to start the chat stream.
   * @returns {Promise<ReadableStream>} - A Promise that resolves to a ReadableStream.
   */
  completionStream: (props: AgentCompletionStreamProps) => Promise<ReadableStream>
  completion: (props: AgentCompletionStreamProps) => Promise<unknown>
}

/**
 * Instance returned by the `createSchemaAgent` function.
 */
export type SchemaAgentInstance = ChatAgentInstance

/**
 * `createChatAgent` creates an agent for a chat-based application using the OpenAI API.
 * It provides a completionStream method that returns a real-time chat stream.
 *
 * @param {CreateChatAgentProps} props - The configuration properties for the chat agent.
 * @returns {ChatAgentInstance} - An object with a method `completionStream` to create a chat stream.
 *
 * @example
 * ```
 * const chatAgent = createChatAgent({ config: {}, identityMessages: [] });
 * const stream = chatAgent.completionStream({ prompt: "", messages: [] });
 * ```
 */
export const createChatAgent = ({ config, identityMessages }: CreateChatAgentProps) => {
  const oai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID ?? undefined
  })

  const agentInstance = {
    /** @hidden */
    _completion: async ({
      prompt,
      messages = [],
      stream = true
    }: AgentCompletionStreamProps & { stream?: boolean }) => {
      const response = await oai.chat.completions.create({
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        n: 1,
        ...config,
        messages: [...identityMessages, ...messages, { role: "user", content: prompt }],
        stream
      } as OpenAI.Chat.ChatCompletionCreateParams)

      return response
    },
    completion: async ({ prompt, messages = [] }: AgentCompletionStreamProps) => {
      const response = await agentInstance._completion({ prompt, messages, stream: false })

      return OAIResponseParser(response)
    },
    completionStream: async ({ prompt, messages = [] }: AgentCompletionStreamProps) => {
      const response = await agentInstance._completion({ prompt, messages, stream: true })

      return OaiStream({ res: response as Stream<OpenAI.Chat.Completions.ChatCompletionChunk> })
    }
  }

  return agentInstance
}

/**
 * `createSchemaAgent` creates a schema agent for an application using the OpenAI API.
 * It provides a completion method that returns a completed task.
 *
 * @param {CreateSchemaAgentProps} props - The configuration properties for the schema agent.
 * @returns {Object} - An object with a method `completion` to complete a task.
 *
 * @example
 * ```
 * const schemaAgent = createSchemaAgent({ config: {}, identityMessages: [], schema: {}, name: "", description: "" });
 * const result = schemaAgent.completionStream({ prompt: "", messages: [] });
 * ```
 */
export const createSchemaAgent = ({
  config,
  identityMessages,
  schema
}: CreateSchemaAgentProps): SchemaAgentInstance => {
  const { definition } = createSchemaFunction({ schema })
  const functionConfig = {
    function_call: {
      name: definition.name
    },
    functions: [
      {
        name: definition.name,
        description: definition.description,
        parameters: {
          type: "object",
          properties: definition.parameters,
          required: definition.required
        }
      }
    ]
  }

  return createChatAgent({
    config: { ...config, ...functionConfig },
    identityMessages
  })
}
