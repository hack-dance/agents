import { createChatAgent } from "@hackdance/agents-core"

const primaryIdentity = `
  you are an ai that is good at everything.
`

export const exampleAgent = createChatAgent({
  config: {
    model: "gpt-3.5-turbo",
    max_tokens: 500,
    temperature: 0.3
  },
  identityMessages: [
    {
      role: "system",
      content: primaryIdentity
    }
  ]
})
