import { createSchemaAgent } from "@hackdance/agents-core"

import { schema } from "./schema"

const primaryIdentity = `
  you are an ai that is good at everything.
`

export const exampleAgent = createSchemaAgent({
  config: {
    model: "gpt-4",
    max_tokens: 500,
    temperature: 0.3
  },
  identityMessages: [
    {
      role: "system",
      content: primaryIdentity
    }
  ],
  schema: schema
})
