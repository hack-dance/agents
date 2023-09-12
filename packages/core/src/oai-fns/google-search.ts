import { FunctionDefinitionInterface, createFunctionDefinition } from "@/oai-fns"
import { z } from "zod"

type GoogleCustomSearchOptions = {
  googleCSEId: string
  customDescription?: string
}

/**
 * `createGoogleCustomSearch` creates a Google Custom Search engine using the provided options.
 * The created function fetches and returns search results from the Google Custom Search API.
 *
 * @param {GoogleCustomSearchOptions} options - The options for the custom search.
 * @returns {FunctionDefinitionInterface} - The function definition for the custom search engine.
 *
 * @example
 *
 * const [googleCustomSearch, googleCustomSearchSchema] = createGoogleCustomSearch({
 *   googleCSEId: 'your_google_cse_id',
 *   customDescription: 'My custom search engine'
 * });
 *
 */
function createGoogleCustomSearch(options: GoogleCustomSearchOptions): FunctionDefinitionInterface {
  const googleCSEId = process.env.GOOGLE_CSE_ID ?? null
  const apiKey = process.env.GOOGLE_SEACH_API_KEY ?? null

  if (!apiKey || !googleCSEId) {
    throw new Error("Google API key and custom search engine id must be set.")
  }

  const paramsSchema = z.object({
    input: z.string()
  })

  const name = "googleCustomSearch"
  const defaultDescription =
    "A custom search engine. Useful for when you need to answer questions about current events. Input should be a search query. Outputs a JSON array of results."

  const description = options.customDescription ?? defaultDescription

  const execute = async ({ input }: z.infer<typeof paramsSchema>): Promise<string> => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${
          options.googleCSEId
        }&q=${encodeURIComponent(input)}`
      )

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      const results =
        data.items?.map((item: { title?: string; link?: string; snippet?: string }) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet
        })) ?? []
      return JSON.stringify(results)
    } catch (error) {
      throw new Error(`Error in GoogleCustomSearch: ${error}`)
    }
  }

  return createFunctionDefinition({ paramsSchema, name, description, execute })
}

export { createGoogleCustomSearch }
