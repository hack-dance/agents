import { exampleAgent } from "@/ai/agents/example-agent"

export const runtime = "edge"

export async function POST(request: Request): Promise<Response> {
  try {
    const { prompt } = await request.json()

    const stream = await exampleAgent.completionStream({
      prompt
    })

    return new Response(stream)
  } catch (error) {
    console.error(error)
    return new Response("could not send message")
  }
}
