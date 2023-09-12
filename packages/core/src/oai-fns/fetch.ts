import { FunctionDefinitionInterface, createFunctionDefinition } from "@/oai-fns"
import { z } from "zod"

type RequestOptions = {
  url?: string
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: Record<string, unknown>
  headers?: Record<string, string>
}

const responseSchema = z.object({}).nonstrict()
/**
 * `createFetch` creates a fetch request function with a provided base options.
 * The created function makes an HTTP request using the fetch API and returns the response.
 *
 * @param {RequestOptions} baseOption - The base options for the fetch request.
 * @returns {FunctionDefinitionInterface} - The function definition for the fetch request.
 *
 * @example
 *
 * const fetchFnDefinition = createFetch({
 *   url: 'https://api.example.com/data',
 *   method: 'GET',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 *
 */
export function createFetch(baseOption: RequestOptions = {}): FunctionDefinitionInterface {
  const paramsSchema = z.object({
    url: z.string(),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    body: z.any().optional(),
    headers: z.record(z.string()).optional()
  })

  const name = "request"
  const description = `Make a fully formed http request using fetch and return the response`

  const execute = async ({
    url,
    method,
    body,
    headers
  }: z.infer<typeof paramsSchema>): Promise<z.infer<typeof responseSchema>> => {
    try {
      const targetUrl = url || baseOption.url
      const targetMethod = method || baseOption.method
      const targetBody = body || baseOption.body
      const targetHeaders = headers || baseOption.headers

      if (!targetUrl || !targetMethod) {
        throw new Error("URL and method are required parameters.")
      }

      const res = await fetch(targetUrl, {
        method: targetMethod,
        body: targetBody ? JSON.stringify(targetBody) : undefined,
        headers: targetHeaders
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      return await res.json()
    } catch (error) {
      throw new Error(`Failed to execute script: ${error.message}`)
    }
  }

  return createFunctionDefinition({ paramsSchema, name, description, execute })
}
