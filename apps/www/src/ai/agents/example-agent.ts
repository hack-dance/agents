import { createChatAgent } from "@hackdance/agents"

const primaryIdentity = `
  you are an ai that is good at everything.
`

export const exampleAgent = createChatAgent({
  config: {
    model: "gpt-4",
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
