import { JSONParser, TokenType } from "@streamparser/json"
import { assocPath } from "ramda"
import { z } from "zod"

//eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaType = z.ZodObject<any>

function getDefaultValue(type: z.ZodTypeAny): unknown {
  switch (type._def.typeName) {
    case "ZodString":
      return ""
    case "ZodNumber":
      return 0
    case "ZodBoolean":
      return false
    case "ZodArray":
      return []
    case "ZodObject":
      return createBlankObject(type as SchemaType)
    case "ZodOptional":
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      return getDefaultValue((type as z.ZodOptional<any>).unwrap())
    case "ZodNullable":
      return null
    default:
      throw new Error(`Unsupported type: ${type._def.typeName}`)
  }
}

function createBlankObject(
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodObject<any>
): object {
  const obj: Record<string, unknown> = {}

  for (const key in schema.shape) {
    const type = schema.shape[key]
    obj[key] = getDefaultValue(type)
  }

  return obj
}

/**
 * `JsonStreamParser` creates a TransformStream that parses JSON data in a streaming manner.
 * The created stream uses the provided zod schema to determine the structure of the output data.
 *
 * @param {SchemaType} schema - The zod schema that describes the structure of the data.
 * @returns {TransformStream} - The created TransformStream.
 *
 * @example
 *
 * const schema = z.object({
 *   response: z.string(),
 *   score: z.number()
 * });
 *
 * const jsonStreamParser = JsonStreamParser(schema);
 *
 * // in the browser
 * const stream = await getStream();
 * const parser = JsonStreamParser(schema)
 * stream?.pipeThrough(parser)
 *
 */
export const JsonStreamParser = (
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodObject<any>
) => {
  let schemaInstance = createBlankObject(schema)
  let activeKey: string | number | null = null
  let isKey = false

  const textEncoder = new TextEncoder()
  const decoder = new TextDecoder()

  const jsonparser = new JSONParser()

  jsonparser.onToken = ({ token, value }) => {
    if ((token === TokenType.STRING || token === TokenType.NUMBER) && !isKey && activeKey) {
      schemaInstance[activeKey] = value as string
      activeKey = null
    }

    if (
      (token === TokenType.STRING || token === TokenType.NUMBER) &&
      schemaInstance.hasOwnProperty(value as string | number) &&
      (typeof schemaInstance[value as string] === "string" ||
        typeof schemaInstance[value as string] === "number")
    ) {
      activeKey = value as string | number
      isKey = true
    }

    if (isKey && activeKey && token === TokenType.COLON) {
      isKey = false
    }
  }

  const stream = new TransformStream({
    async transform(chunk, controller): Promise<void> {
      try {
        if (activeKey && !isKey) {
          const decoded = decoder.decode(chunk)

          const updatedContent = (schemaInstance[activeKey] += decoded)

          if (updatedContent.length > 3 && updatedContent.startsWith('"')) {
            schemaInstance = assocPath([activeKey], updatedContent.slice(1), schemaInstance)
          } else {
            schemaInstance = assocPath([activeKey], updatedContent, schemaInstance)
          }
        }

        jsonparser.write(chunk)
        controller.enqueue(textEncoder.encode(JSON.stringify(schemaInstance)))
      } catch (e) {
        console.error(e)
      }
    },
    flush(_controller) {
      jsonparser.end()
    }
  })

  return stream
}
