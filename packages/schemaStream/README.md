# schema-stream

`schema-stream` is a utility for parsing streams of JSON data. It provides a safe-to-read-from stubbed version of the data before the stream has fully completed.

The parser has been mostly forked from:
https://github.com/juanjoDiaz/streamparser-json
https://www.npmjs.com/package/@streamparser/json


The primary difference is that this requires a zod schema and optional default data, to allow for a fully stubbed version of the expected data to be returned before the stream has completed. This allows for partially parsed data to be returned to the user asap, and for the user to be able to start working with the data before the stream has completed.

I put this together to work alongside some other packages I have for workign with OpenAI streams. Using zod schemas to define a desired output and a set of react hooks for consuming that structured json output incrementally.

## Related Packages

### [@hackdance/hooks](https://github.com/hack-dance/agents/packages/hooks)
A set of react hooks for working with streams. Includes a use-json-stream hook that uses this package
to incrementally parse a stream of json data.

### [@hackdance/agents](https://github.com/hack-dance/agents/packages/agents)
A set of react hooks for working with streams. Includes a use-json-stream hook that uses this package
to incrementally parse a stream of json data.


## Installation

```bash
  pnpm add zod schema-stream
```


```typescript
import { SchemaStream } from 'schema-stream'
```


## Usage

To use `schema-stream`, you need to create a new instance of the class, passing in a Zod schema and optional default data.
Then, you can call the `parse` method on the instance to parse a JSON stream.

```typescript

const schema = z.object({
  someString: z.string(),
  someNumber: z.number()
})

const response = await getSomeStreamOfJson()

const parser = new SchemaStream(schema, {
  someString: "default string"
})

const streamParser = parser.parse({
  stringStreaming: true
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

```
  constructor(schema: SchemaType, {
    defaultData?: object,
    onKeyComplete?: ({ completedKeys, activeKey }) => void
  })
```

The constructor takes a Zod schema as an argument for validation. The top level of the schema must be an object.


### `parse(options: ParseOptions): TransformStream`

The `parse` method returns a `TransformStream` that can be used to process the JSON data. It accepts an options object as an argument.

| Argument | Type | Description | Default |
| --- | --- | --- | --- |
| `options` | `Object` | An options object for the parse method. | `{}` |
| `options.stringStreaming` | `boolean` | (currently only works with string fields set on the root.) If set to true, the parser will stream string values. This is useful when dealing with large strings that might otherwise cause the parser to run out of memory, or you want to return to the user asap. | `false` |



## Note
The root must be a plain object.

Please note that when expecting arrays of any type, the array values will not be stubbed since
we don't know the length of those arrays beforehand - so the default will jsut be an empty lis, unless your pass in your own defaults.
