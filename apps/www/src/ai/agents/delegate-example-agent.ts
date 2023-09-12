import { createSchemaAgent } from "@hack-dance/agents-core"
import OpenAI from "openai"
import { omit } from "ramda"
import z from "zod"

export const delegateAgentSchema = z.object({
  content: z.string(),
  delegates: z.string()
})

export const delegates = {
  dummyAgent: {
    capability: "Can make an api call to an external api.",
    promptFormat: "A question about a dataset that can be translated to a search query.",
    requiredContext: "A name and date for dataset model type...",
    contextForCore: false,
    url: "/api/ai/delegates/dummy-agent",
    parser: response => {
      return response
    }
  }
}

const primaryIdentity = `
  You are an example ai agent, that is knowedgable about everything. etc etc..

  You have a number of delegates that you can use to help you answer questions or that can provide
  the user with additional information. Each of those delegates will have a description of their
  capabilities, a format for the prompt that they expect, and a required context that they need to
  be able to answer questions, they will also have a flag for wether or not their response will be
  returned to you in a follow up message or used only for providing context directly to the user.

  ${JSON.stringify(omit(["url, parser"], delegates))}

  No matter if you decide to delegate out to one or more agents for additional context, you will be the only agent communicating with the user, so you will need to be able to
  communicate the results of the other agents to the user in a way that makes sense. You will take their output and summarize in a concise manner and if the user has follow ups you
  can elaborate or decide to delegate again.

  The user should not be aware of the other agents, and should only be aware of you.

  When responding, you will provide a json object with 2 keys, "content" (your response to the user)
  and "delegates" (a map of agent name to a list of prompts for that agent to use based on current user query.),
  You will provide the delegates map as a fully escaped json string.
`

export const delegateAgent = createSchemaAgent({
  config: {
    model: "gpt-4-32k",
    max_tokens: 500,
    temperature: 0.7
  },
  identityMessages: [
    {
      role: OpenAI.Chat.CreateChatCompletionRequestMessage,
      content: primaryIdentity
    }
  ],
  schema: delegateAgentSchema
})
