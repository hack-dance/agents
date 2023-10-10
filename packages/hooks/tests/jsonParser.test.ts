import { describe, expect, test } from "@jest/globals"
import { ZodObject, ZodRawShape, z } from "zod"

import { JsonStreamParser } from "../src/utils/streaming-json-parser"

async function runTest<T extends ZodRawShape>(schema: ZodObject<T>, jsonData: object) {
  const parser = new JsonStreamParser(schema)
  const stream = parser.parse()

  const readableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(JSON.stringify(jsonData))
      controller.close()
    }
  })

  readableStream.pipeThrough(stream)

  const reader = stream.readable.getReader()
  const { value } = await reader.read()

  const parsedData = JSON.parse(new TextDecoder().decode(value))

  console.log({
    parsedData,
    jsonData
  })

  expect(parsedData).toEqual(jsonData)
}

describe("JsonStreamParser", () => {
  test("should parse valid JSON correctly - single layer primitives", async () => {
    const schema = z.object({
      someString: z.string(),
      someNumber: z.number(),
      someBoolean: z.boolean()
    })

    const data = {
      someString: "test",
      someNumber: 123,
      someBoolean: true
    }

    await runTest(schema, data)
  })

  // Test for nested json - up to 5 layers deep
  test("should parse valid JSON correctly - multi-layer object nesting", async () => {
    const schema = z.object({
      layer1: z.object({
        layer2: z.object({
          layer3: z.object({
            layer4: z.object({
              layer5: z.string()
            })
          })
        })
      })
    })

    const data = {
      layer1: {
        layer2: {
          layer3: {
            layer4: {
              layer5: "test"
            }
          }
        }
      }
    }

    await runTest(schema, data)
  })

  // Test for object arrays - single layer deep for now on the objects in those arrays
  test("should parse valid JSON correctly - single layer object array nesting", async () => {
    const schema = z.object({
      someArray: z.array(
        z.object({
          someString: z.string(),
          someNumber: z.number()
        })
      )
    })

    const data = {
      someArray: [
        {
          someString: "test",
          someNumber: 123
        },
        {
          someString: "test2",
          someNumber: 456
        }
      ]
    }

    await runTest(schema, data)
  })

  // Test for arrays of strings with things like commas braces and brackets
  test("should parse valid JSON correctly - arrays of strings with special characters", async () => {
    const schema = z.object({
      someArray: z.array(z.string())
    })

    const data = {
      someArray: ["test]", "{test2", "[test2", "test2}", "test2,", ":test2"]
    }

    await runTest(schema, data)
  })

  // Test for any other string value for objects or straight strings with those types of characters
  test("should parse valid JSON correctly - strings with special characters", async () => {
    const schema = z.object({
      someString: z.string(),
      someString2: z.string(),
      someString3: z.string(),
      someString4: z.string(),
      someString5: z.string(),
      someString6: z.string()
    })

    const data = {
      someString: "test]",
      someString2: "{test2",
      someString3: "[test2",
      someString4: "test2}",
      someString5: "test2,",
      someString6: ":test2"
    }

    await runTest(schema, data)
  })
})
