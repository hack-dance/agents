import { createChatAgent } from "@hack-dance/agents-core"

const primaryIdentity = `
  you are an ai that is good at everything.
`

export const dummyAgent = createChatAgent({
  config: {
    model: "gpt-4-32k-0613",
    max_tokens: 500,
    temperature: 0.7
  },
  identityMessages: [
    {
      role: "system",
      content: primaryIdentity
    }
  ]
})
