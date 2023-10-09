import { JSONParser, TokenType } from "@streamparser/json"
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
    case "ZodRecord":
      return {}
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

function setDeepValue(
  obj: Record<string, any>,
  path: (string | number)[],
  value: any
): Record<string, any> {
  if (!path.length) return obj

  let current = obj
  for (let i = 0; i < path.length - 1; i++) {
    if (!current[path[i]]) {
      if (typeof path[i + 1] === "number") {
        current[path[i]] = []
      } else {
        current[path[i]] = {}
      }
    }
    current = current[path[i]]
  }

  if (Array.isArray(current) && typeof path[path.length - 1] === "number") {
    current.push(value)
  } else {
    current[path[path.length - 1]] = value
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
  const pathStack: (string | number)[] = []
  let activeKey: string | number | null = null
  let isKey = false
  let isInArray = false
  let arrayIndex = 0
  let schemaInstance = createBlankObject(schema)

  const textEncoder = new TextEncoder()
  const jsonparser = new JSONParser()

  jsonparser.onValue = ({}) => {
    //eslint-disable-next-line
  }

  function handleKeyValue(value: string | number) {
    const fullPath = [...pathStack]
    if (isInArray) {
      fullPath.push(arrayIndex++)
    } else {
      fullPath.push(activeKey as string | number)
    }

    schemaInstance = setDeepValue(schemaInstance, fullPath, value)
  }

  jsonparser.onToken = ({ token, value }) => {
    try {
      switch (token) {
        case TokenType.STRING:
          if (isKey) {
            activeKey = value as string
          } else {
            handleKeyValue(value as string)
          }
          break

        case TokenType.NUMBER:
          handleKeyValue(value as number)
          break

        case TokenType.LEFT_BRACE:
          if (activeKey !== null) {
            pathStack.push(activeKey)
            activeKey = null
          }
          isKey = true
          break

        case TokenType.LEFT_BRACKET:
          if (activeKey !== null) {
            pathStack.push(activeKey)
            activeKey = null
          }
          isInArray = true
          arrayIndex = 0
          break

        case TokenType.RIGHT_BRACE:
        case TokenType.RIGHT_BRACKET:
          if (pathStack.length > 0) {
            activeKey = pathStack.pop() as string | number
          }
          if (token === TokenType.RIGHT_BRACKET) {
            isInArray = false
            arrayIndex = 0
          }
          break

        case TokenType.COLON:
          isKey = false
          break

        case TokenType.COMMA:
          activeKey = null
          isKey = !isInArray
          break
      }
    } catch (e) {
      console.error(`Error in the json parser onToken handler: token ${token} value ${value}`, e)
    }
  }

  const stream = new TransformStream({
    async transform(chunk, controller): Promise<void> {
      try {
        jsonparser.write(chunk)
        controller.enqueue(textEncoder.encode(JSON.stringify(schemaInstance)))
      } catch (e) {
        console.error(`Error in the json parser transform stream: parsing chunk`, e)
      }
    },
    flush(_controller) {
      jsonparser.end()
    }
  })

  return stream
}
