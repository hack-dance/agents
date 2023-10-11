import { exampleAgent } from "@/ai/agents/chat-agent"

export const runtime = "edge"

export async function POST(request: Request): Promise<Response> {
  try {
    const { prompt = "", ctx } = await request.json()

    const stream = await exampleAgent.completionStream({
      prompt,
      messages: ctx?.messages
    })

    return new Response(stream)
  } catch (error) {
    console.error(error)
    return new Response("could not send message")
  }
}
