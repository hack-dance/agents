import { JSONParser, TokenType } from "@streamparser/json"
import { ZodObject, ZodOptional, ZodRawShape, ZodTypeAny, z } from "zod"

type SchemaType<T extends ZodRawShape = ZodRawShape> = ZodObject<T>

type NestedValue = string | number | boolean | NestedObject | NestedValue[]
type NestedObject = { [key: string]: NestedValue } | { [key: number]: NestedValue }

type Path = Array<string | number | null>

/**
 * Retrieves the value at a given path within a nested object or array. If the path does not exist, it returns a default value.
 *
 * @template T - The type of the default value and the expected return type.
 * @param {T} defaultValue - The default value to return if the path does not exist in the object.
 * @param {Array<string | number>} path - An array representing the path to retrieve the value from. Each element can be a string (for object properties) or a number (for array indices).
 * @param {Record<string | number, U>} object - The nested object or array to retrieve the value from.
 * @returns {T | U} - The value at the given path within the object, or the default value if the path does not exist.
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 42 } } };
 * const path = ['a', 'b', 'c'];
 * const defaultValue = 0;
 * console.log(pathOr(defaultValue, path, obj)); // Outputs: 42
 * ```
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 42 } } };
 * const path = ['a', 'b', 'd'];
 * const defaultValue = 0;
 * console.log(pathOr(defaultValue, path, obj)); // Outputs: 0
 * ```
 */
function pathOr<T, U>(defaultValue: T, path: Path, object: Record<string | number, U>): T | U {
  let current: U | Record<string | number, U> = object

  for (let i = 0; i < path.length; i++) {
    const key = path[i]

    if (key === null || key === undefined || current[key as string | number] == null) {
      return defaultValue
    }

    current = (current as Record<string | number, U>)[key as string | number]
  }

  return current as U
}

/**
 * `SchemaStream` is a utility class for parsing streams of json and
 * providing a safe-read-from stubbed version of the data before the stream
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
  private pathStack: (string | number)[]
  private activeKey: string | number | null
  private isKey: boolean
  private isInArray: boolean
  private arrayIndex: number
  private schemaInstance: NestedObject
  private expectedArrayTypeStack: ("object" | "primitive")[]

  /**
   * Constructs a new instance of the `SchemaStream` class.
   *
   * @param schema - The Zod schema to use for validation.
   */
  constructor(private schema: SchemaType) {
    this.expectedArrayTypeStack = []
    this.pathStack = []
    this.activeKey = null
    this.isKey = false
    this.isInArray = false
    this.arrayIndex = 0
    this.schemaInstance = this.createBlankObject(schema)
  }

  /**
   * Gets the default value for a given Zod type.
   *
   * @param type - The Zod type.
   * @returns The default value for the type.
   */
  private getDefaultValue(type: ZodTypeAny): unknown {
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
        return this.createBlankObject(type as SchemaType)
      case "ZodOptional":
        //eslint-disable-next-line
        return this.getDefaultValue((type as ZodOptional<any>).unwrap())
      case "ZodNullable":
        return null
      default:
        throw new Error(`Unsupported type: ${type._def.typeName}`)
    }
  }

  private createBlankObject<T extends ZodRawShape>(schema: SchemaType<T>): NestedObject {
    const obj: NestedObject = {}

    for (const key in schema.shape) {
      const type = schema.shape[key]
      obj[key as string] = this.getDefaultValue(type)
    }

    return obj
  }

  /**
   * Sets a deep value in a nested object.
   *
   * @param obj - The object to modify.
   * @param path - The path to the value.
   * @param value - The value to set.
   * @returns The modified object.
   */
  private setDeepValue(
    obj: NestedObject,
    path: (string | number)[],
    value: NestedValue
  ): NestedObject {
    if (!path.length) return obj

    let current: NestedValue | NestedObject = obj
    for (let i = 0; i < path.length - 1; i++) {
      const keyOrIndex = path[i]
      if (typeof keyOrIndex === "number") {
        if (!Array.isArray(current[keyOrIndex])) {
          ;(current as NestedObject)[keyOrIndex] = []
        }
      } else {
        if (typeof current[keyOrIndex] !== "object" || current[keyOrIndex] === null) {
          ;(current as NestedObject)[keyOrIndex] = {}
        }
      }

      current = (current as NestedObject)[keyOrIndex]
    }

    const lastKeyOrIndex = path[path.length - 1]
    if (Array.isArray(current)) {
      if (typeof lastKeyOrIndex === "number") {
        current[lastKeyOrIndex] = value
      } else {
        console.error("Trying to set a string key on an array.")
      }
    } else {
      ;(current as NestedObject)[lastKeyOrIndex] = value
    }

    return obj
  }

  private addToPath(value: string | number): void {
    this.pathStack.push(value)
  }

  private removeFromPath(): string | number | undefined {
    return this.pathStack.pop()
  }

  private isCurrentTypeObject(): boolean {
    const currentSchemaType = pathOr(null, [...this.pathStack, this.activeKey], this.schema.shape)
    return currentSchemaType instanceof z.ZodObject
  }

  private isCurrentTypeString(): boolean {
    const currentSchemaType = pathOr(null, [...this.pathStack, this.activeKey], this.schema.shape)
    return currentSchemaType instanceof z.ZodString
  }

  private isCurrentTypeArray(): boolean {
    const currentSchemaType = pathOr(null, [...this.pathStack, this.activeKey], this.schema.shape)
    return currentSchemaType instanceof z.ZodArray
  }

  private isCurrentArrayTypeChildObject(): boolean {
    const currentSchemaType = pathOr(null, [...this.pathStack, this.activeKey], this.schema.shape)
    return (
      currentSchemaType instanceof z.ZodArray && currentSchemaType.element instanceof z.ZodObject
    )
  }

  private isCurrentArrayTypeChildString(): boolean {
    const currentSchemaType = pathOr(null, [...this.pathStack, this.activeKey], this.schema.shape)
    return (
      currentSchemaType instanceof z.ZodArray && currentSchemaType.element instanceof z.ZodString
    )
  }

  private isExpectedArrayObject(): boolean {
    return this.expectedArrayTypeStack[this.expectedArrayTypeStack.length - 1] === "object"
  }

  private getCurrentObjectPath(): (string | number)[] {
    const currentObjectPath = [...this.pathStack]
    if (this.isExpectedArrayObject()) {
      currentObjectPath.push(this.arrayIndex)
    }
    return currentObjectPath
  }

  private updateCurrentObject(value: string | number | boolean): void {
    const currentObjectPath = this.getCurrentObjectPath()
    const currentObject = pathOr({}, currentObjectPath, this.schemaInstance)
    currentObject[this.activeKey as string] = value

    this.schemaInstance = this.setDeepValue(this.schemaInstance, currentObjectPath, currentObject)
    this.activeKey = null
  }

  private handleKeyValue(value: string | number | boolean) {
    const fullPath = [...this.pathStack]

    if (this.isInArray) {
      fullPath.push(this.arrayIndex)

      if (!this.isExpectedArrayObject()) {
        this.arrayIndex = this.arrayIndex + 1
      }
    } else {
      fullPath.push(this.activeKey as string | number)
    }

    if (this.isExpectedArrayObject()) {
      this.updateCurrentObject(value)
    } else {
      this.schemaInstance = this.setDeepValue(this.schemaInstance, fullPath, value)
    }

    this.activeKey = null
  }

  private tokenHandlers = new Map([
    [
      TokenType.STRING,
      (value: string | number) => {
        if (this.isKey) {
          this.activeKey = value as string
        } else {
          this.handleKeyValue(value as string | number)
        }
      }
    ],
    [
      TokenType.NUMBER,
      (value: string | number) => {
        this.handleKeyValue(value as number)
      }
    ],
    [
      TokenType.TRUE,
      () => {
        this.handleKeyValue(true)
      }
    ],
    [
      TokenType.FALSE,
      () => {
        this.handleKeyValue(false)
      }
    ],
    [
      TokenType.LEFT_BRACKET,
      () => {
        if (this.isCurrentTypeObject()) {
          this.expectedArrayTypeStack.push("object")
        }

        if (this.isCurrentTypeArray()) {
          if (this.isCurrentArrayTypeChildObject()) {
            this.expectedArrayTypeStack.push("object")
          } else {
            this.expectedArrayTypeStack.push("primitive")
          }
        }

        if (this.activeKey !== null) {
          this.addToPath(this.activeKey)
        }

        this.isInArray = true
        this.arrayIndex = 0
      }
    ],
    [
      TokenType.LEFT_BRACE,
      () => {
        if (this.activeKey !== null && !this.isInArray) {
          this.addToPath(this.activeKey)
        }

        this.isKey = true
      }
    ],
    [
      TokenType.RIGHT_BRACE,
      () => {
        if (this.pathStack.length > 0 && !this.isInArray) {
          this.activeKey = this.removeFromPath() as string | number
        }

        if (this.isInArray) {
          this.arrayIndex = this.arrayIndex + 1
        }
      }
    ],
    [
      TokenType.RIGHT_BRACKET,
      () => {
        this.expectedArrayTypeStack.pop()

        this.isInArray = false
        this.arrayIndex = 0

        if (this.pathStack.length > 0) {
          this.activeKey = this.removeFromPath() as string | number
        }
      }
    ],
    [
      TokenType.COLON,
      () => {
        this.isKey = false
      }
    ],
    [
      TokenType.COMMA,
      () => {
        this.activeKey = null
        if (this.isInArray && this.isExpectedArrayObject()) {
          this.isKey = true
        } else {
          this.isKey = !this.isInArray
        }
      }
    ]
  ])

  private handleToken({ token, value }) {
    try {
      const handler = this.tokenHandlers.get(token)
      if (handler) {
        handler(value)
      } else {
        console.error(`Unhandled token type: ${token}`)
      }
    } catch (e) {
      console.error(`Error in the json parser onToken handler: token ${token} value ${value}`, e)
    }
  }

  private handleStreamingPartialValues(chunk) {
    if (this.activeKey && !this.isKey && this.isCurrentTypeString()) {
      const decoder = new TextDecoder()

      try {
        let decoded = decoder.decode(chunk)

        if (decoded.startsWith('"') && !decoded.startsWith('\\"')) {
          decoded = decoded.slice(1)
        }
        if (decoded.endsWith('"') && !decoded.endsWith('\\"')) {
          decoded = decoded.slice(0, -1)
        }

        let currentValue = pathOr("", [this.activeKey], this.schemaInstance)
        currentValue = currentValue += decoded

        this.schemaInstance = this.setDeepValue(this.schemaInstance, [this.activeKey], currentValue)
      } catch (e) {
        console.warn("schema-stream: error attempting to set streaming string value", e)
      }
    }
  }

  public getSchemaStub<T extends ZodRawShape>(schema: SchemaType<T>): z.infer<typeof schema> {
    return this.createBlankObject(schema) as z.infer<typeof schema>
  }

  /**
   * Parses the JSON stream.
   *
   * @param {Object} opts - The options for parsing the JSON stream.
   * @param {boolean} [opts.enableStringStreaming=true] - Whether to enable streaming of partial strings. If this is true, chunks of a string value will be added to the stubbed version of the data as soon as they are parsed.
   * @returns A `TransformStream` that can be used to process the JSON data.
   */
  public parse(opts: { enableStringStreaming?: boolean } = { enableStringStreaming: true }) {
    const { enableStringStreaming = true } = opts
    const textEncoder = new TextEncoder()
    const jsonparser = new JSONParser()

    jsonparser.onValue = ({}) => {
      //eslint-disable-next-line
    }

    jsonparser.onToken = this.handleToken.bind(this)

    const stream = new TransformStream({
      transform: async (chunk, controller): Promise<void> => {
        try {
          jsonparser.write(chunk)

          if (enableStringStreaming) {
            this.handleStreamingPartialValues(chunk)
          }

          controller.enqueue(textEncoder.encode(JSON.stringify(this.schemaInstance)))
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
}