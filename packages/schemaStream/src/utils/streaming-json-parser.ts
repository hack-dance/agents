import { lensPath, set, view } from "ramda"
import { ZodObject, ZodOptional, ZodRawShape, ZodTypeAny, z } from "zod"

import JSONParser from "./json-parser"

type SchemaType<T extends ZodRawShape = ZodRawShape> = ZodObject<T>
type TypeDefaults = {
  string?: string | null | undefined
  number?: number | null | undefined
  boolean?: boolean | null | undefined
}

type NestedValue = string | number | boolean | NestedObject | NestedValue[]
type NestedObject = { [key: string]: NestedValue } | { [key: number]: NestedValue }

/**
 * `SchemaStream` is a utility for parsing streams of json and
 * providing a safe-to-read-from stubbed version of the data before the stream
 * has fully completed.
 *
 * It uses Zod for schema validation and the Streamparser library for
 * parsing JSON from an input stream.
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   someString: z.string(),
 *   someNumber: z.number()
 * })
 *
 * const response = await getSomeStreamOfJson()
 * const parser = new SchemaStream(schema)
 * const streamParser = parser.parse()
 *
 * response.body?.pipeThrough(parser)
 *
 * const reader = streamParser.readable.getReader()
 *
 * const decoder = new TextDecoder()
 * let result = {}
 * while (!done) {
 *   const { value, done: doneReading } = await reader.read()
 *   done = doneReading
 *
 *   if (done) {
 *     console.log(result)
 *     break
 *   }
 *
 *   const chunkValue = decoder.decode(value)
 *   result = JSON.parse(chunkValue)
 * }
 * ```
 *
 * @public
 */

export class SchemaStream {
  private schemaInstance: NestedObject
  private stringStreaming: boolean
  private activeKey: string | undefined
  private completedKeys: string[] = []
  private onKeyComplete?: (data) => void | undefined

  /**
   * Constructs a new instance of the `SchemaStream` class.
   *
   * @param schema - The Zod schema to use for validation.
   */
  constructor(
    private schema: SchemaType,
    opts: {
      defaultData?: object | null
      typeDefaults?: TypeDefaults
      onKeyComplete?: (data) => void | undefined
    } = {}
  ) {
    const { defaultData, onKeyComplete, typeDefaults } = opts

    this.stringStreaming = true
    this.schemaInstance = this.createBlankObject(schema, defaultData, typeDefaults)
    this.onKeyComplete = onKeyComplete
  }

  /**
   * Gets the default value for a given Zod type.
   *
   * @param type - The Zod type.
   * @returns The default value for the type.
   */
  private getDefaultValue(type: ZodTypeAny, typeDefaults?: TypeDefaults): unknown {
    switch (type._def.typeName) {
      case "ZodString":
        return typeDefaults?.hasOwnProperty("string") ? typeDefaults.string : ""
      case "ZodNumber":
        return typeDefaults?.hasOwnProperty("number") ? typeDefaults.number : 0
      case "ZodBoolean":
        return typeDefaults?.hasOwnProperty("boolean") ? typeDefaults.boolean : false
      case "ZodArray":
        return []
      case "ZodRecord":
        return {}
      case "ZodObject":
        return this.createBlankObject(type as SchemaType)
      case "ZodOptional":
        //eslint-disable-next-line
        return this.getDefaultValue((type as ZodOptional<any>).unwrap())
      case "ZodEffects":
        return this.getDefaultValue(type._def.schema)
      case "ZodNullable":
        return null
      default:
        throw new Error(`Unsupported type: ${type._def.typeName}`)
    }
  }

  private createBlankObject<T extends ZodRawShape>(
    schema: SchemaType<T>,
    defaultData?: object | null,
    typeDefaults?: TypeDefaults
  ): NestedObject {
    const obj: NestedObject = {}

    for (const key in schema.shape) {
      const type = schema.shape[key]
      if (defaultData && defaultData[key as unknown as keyof NestedObject]) {
        obj[key as string] = defaultData[key as unknown as keyof NestedObject]
      } else {
        obj[key as string] = this.getDefaultValue(type, typeDefaults)
      }
    }

    return obj
  }

  private handleToken({ token, value, partial, key, stack }) {
    if (this.activeKey !== key) {
      this.activeKey = key

      if (typeof this.activeKey === "string") {
        this.completedKeys.push(this.activeKey)

        this.onKeyComplete &&
          this.onKeyComplete({
            completedKeys: this.completedKeys,
            activeKey: this.activeKey
          })
      }
    }

    if (typeof key === undefined) return

    try {
      const valuePath = [...stack.map(({ key }) => key), key]
      valuePath.shift()
      const lens = lensPath(valuePath)

      if (partial) {
        let currentValue = view(lens, value, this.schemaInstance) ?? ""
        const updatedValue = (currentValue += value)
        const updatedSchemaInstance = set(lens, updatedValue, this.schemaInstance)
        this.schemaInstance = updatedSchemaInstance
      } else {
        const updatedSchemaInstance = set(lens, value, this.schemaInstance)
        this.schemaInstance = updatedSchemaInstance
      }
    } catch (e) {
      console.error(`Error in the json parser onToken handler: token ${token} value ${value}`, e)
    }
  }

  public getSchemaStub<T extends ZodRawShape>(
    schema: SchemaType<T>,
    defaultData?: object | null
  ): z.infer<typeof schema> {
    return this.createBlankObject(schema, defaultData) as z.infer<typeof schema>
  }

  /**
   * Parses the JSON stream.
   *
   * @param {Object} opts - The options for parsing the JSON stream.
   * @param {boolean} [opts.stringStreaming=true] - Whether to enable streaming of partial strings. If this is true, chunks of a string value will be added to the stubbed version of the data as soon as they are parsed.
   * @returns A `TransformStream` that can be used to process the JSON data.
   */
  public parse(
    opts: {
      stringStreaming?: boolean
      stringBufferSize?: number
      handleUnescapedNewLines?: boolean
    } = { stringStreaming: true, stringBufferSize: 0, handleUnescapedNewLines: true }
  ) {
    this.stringStreaming = opts.stringStreaming ?? this.stringStreaming

    const textEncoder = new TextEncoder()
    const parser = new JSONParser({
      stringBufferSize: opts.stringBufferSize ?? 0,
      handleUnescapedNewLines: opts.handleUnescapedNewLines ?? true
    })

    parser.onToken = this.handleToken.bind(this)
    parser.onValue = () => void 0

    const stream = new TransformStream({
      transform: async (chunk, controller): Promise<void> => {
        try {
          parser.write(chunk)
          controller.enqueue(textEncoder.encode(JSON.stringify(this.schemaInstance)))
        } catch (e) {
          console.error(`Error in the json parser transform stream: parsing chunk`, e, chunk)
        }
      },
      flush() {
        this.activeKey = undefined
      }
    })

    return stream
  }
}
