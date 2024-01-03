import { describe, expect, test } from "@jest/globals"
import { z } from "zod"

import { createSchemaAgent } from "../src/ai/agents"

const testAgent = createSchemaAgent({
  config: {
    model: "gpt-3.5-turbo"
  },
  identityMessages: [
    {
      content: "You are an ai agent tasked with generating info about random people.",
      role: "system"
    }
  ],
  schema: z.object({
    name: z.string(),
    age: z.number(),
    bio: z.string()
  })
})

test("Schema Agents", async () => {
  describe("should return json using procided schema", async () => {
    const completion = await testAgent.completion({
      prompt: "Generate a random person"
    })

    const completionData = JSON.parse(completion)

    expect(completionData).toEqual({
      name: expect.any(String),
      age: expect.any(Number),
      bio: expect.any(String)
    })
  })
})
