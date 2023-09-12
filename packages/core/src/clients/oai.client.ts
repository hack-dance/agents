import OpenAI from "openai"

if (typeof window === "undefined" && !process?.env?.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not defined.")
}

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID ?? undefined
}

export const OpenAIClient = new OpenAI(configuration)
