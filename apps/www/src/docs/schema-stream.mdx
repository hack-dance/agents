# schema-stream

`schema-stream` is a utility class for parsing streams of JSON data. It provides a safe-to-read-from stubbed version of the data before the stream has fully completed.

It uses Zod for schema validation and the [@streamparser/json](https://www.npmjs.com/package/@streamparser/json) library for parsing JSON from an input stream.

## Installation

```bash
  pnpm add schema-stream
```


```typescript
import { SchemaStream } from 'schema-stream'
```


## Usage

To use `schema-stream`, you need to create a new instance of the class, passing in a Zod schema for validation. Then, you can call the `parse` method on the instance to parse a JSON stream.

```typescript

const schema = z.object({
someString: z.string(),
someNumber: z.number()
})

const response = await getSomeStreamOfJson()

const parser = new SchemaStream(schema)
const streamParser = parser.parse({
  enableStringStreaming: true
})

response.body?.pipeThrough(parser)

const reader = streamParser.readable.getReader()
const decoder = new TextDecoder()
let result = {}

while (!done) {
  const { value, done: doneReading } = await reader.read()
  done = doneReading

  if (done) {
    console.log(result)
    break
  }

  const chunkValue = decoder.decode(value)
  result = JSON.parse(chunkValue)
}
```


## API

### `constructor(schema: SchemaType)`
The constructor takes a Zod schema as an argument for validation. The top level of the schema must be an object.


### `parse(options: ParseOptions): TransformStream`

The `parse` method returns a `TransformStream` that can be used to process the JSON data. It accepts an options object as an argument.

| Argument | Type | Description | Default |
| --- | --- | --- | --- |
| `options` | `Object` | An options object for the parse method. | `{}` |
| `options.enableStringStreaming` | `boolean` | (currently only works with string fields set on the root.) If set to true, the parser will stream string values. This is useful when dealing with large strings that might otherwise cause the parser to run out of memory, or you want to return to the user asap. | `false` |


## Error Handling
`schema-stream` includes error handling for unsupported Zod types and unhandled token types.
It also logs errors that occur in the JSON parser's onToken handler and the transform stream.

--more to come--


## Note
This utility is designed to be used with streams of JSON data.

Please note that when expecting arrays of any type, the array values will not be stubbed since we don't know the length of those arrays beforehand - so the default will jsut be an empty list.
