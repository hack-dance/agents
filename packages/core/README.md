# @hackdance/agents
A set of utilities to make working with open ai simpler.

See the full docs and example usage here: [Docs](https://oss.hack.dance).

There is also a package with react hooks that make it simple to interact with these agents and streams: [@hackdance/hooks](https://oss.hack.dance)



## Getting Started

```bash
pnpm add @hackdance/agents
```


## Agents
Creating Agent. Agents are used to manage the state of the ai and the ai's identity.
and allow for a simpler interface to the ai. You can create multiple agents to manage
different tasks, compose them together, or use them in different contexts.

The 2 types of agents you can create are `ChatAgent` and `SchemaAgent`. Chat agents are
simple wrappers around OpenAi's chat completion api. Schema agents extend the base ChatAgent
by providing a default function that will guarantee the ai's response in a json format you
can define using a Zod schema.
__

**Chat Agent Example:**

```ts
import { createChatAgent } from '@hackdance/agents';

const myAgent = createChatAgent({
  config: {
    model: "gpt-4"
  },
  identityMessages: [{
    role: "system",
    content: "You are an ai assistant tasked with helping users write better documentation."
  }]
});

const stream = await myAgent.completionStream({
  messages: [], //previous message history or more context etc..
  prompt: "Help me write docs for this code: function() { return 'hello world' }"
})
```

__

**Schema Agent Example:**
When using a schema agent, you must provide a zod schema that will be used to validate
the ai's response. The ai's response will be in the form of a json object with the keys
being the names of the fields in the schema. The values will be the ai's response for
that field. If the ai's response does not match the schema, the agent will throw an error.

When returning a stream, the agent will return a fully parsable json object that matches
the schema, and will stream values as they are received from the ai. This allows you to
use the structured response immeadiately, and not have to wait for the ai to finish
completing the response.

```ts
import { createSchemaAgent } from '@hackdance/agents';

const myAgent = createSchemaAgent({
  config: {
    model: "gpt-4"
  },
  identityMessages: [
    {
      role: "system",
      content:
        "You are an ai who is tasked with returning random quotes from scientists and philosophers. You will return each quote always with the attribution of the quote at the end"
    }
  ],
  schema: z.object({
    scientist: z.string({
      description: "A quote from a scientist"
    }),
    philosopher: z.string({
      description: "A quote from a philosopher"
    })
  })
})

const stream = await myAgent.completionStream({
  messages: [], //previous message history or more context etc..
  prompt: "Help me write docs for this code: function() { return 'hello world' }"
})
```

## OAI Funtions
Function definitions are just a standard way to define a function that can be used
by the api. A function definition requires a zod schema that defines the parameters you function needs and the actual function to execute.

Anythign returned by the api will first be validated against your provided schema, if anything is missing an error will be thrown.


Creating and using your own function definitions
```ts
import { createFunctionDefinition } from '@hackdance/agents';

const getArticlesFn = createFunctionDefinition({
  name: "Internal Api Request",
  description: "A function that makes a request to a home improvement article API.",
  paramsSchema: z.object({
    query: z.string({
      description: "A search query for the api."
    })
  }),
  execute: ({ query }) => {
    return fetch(`https://my-api.com/articles/search?q=${query}`)
  }
})

const getProductsFn = createFunctionDefinition({
  name: "Internal Api Request",
  description: "A function that makes a request to a home improvement inventory API.",
  paramsSchema: z.object({
    query: z.string({
      description: "A search query for the api.",
      category: "The category of the product."
    })
  }),
  execute: ({ query }) => {
    return fetch(`https://my-api.com/products/search?q=${query}&category=${category}`)
  }
})

const functionDefinitions = [getArticlesFn, getProductsFn]

const myInternalDataQueryAgent = createChatAgent({
  config: {
    model: "gpt-4",
    functions: functionDefinitions
  },
  identityMessages: [{
    role: "system",
    content: "You are an ai assistant tasked with helping users write better documentation."
  }]
});

const response = await myQueryGeneratorAgent.completion({
  prompt: "I want to change the tile in my bathroom, can you help me?",
})

const fnExecutionReturn = executeFunctionFromResponse(response, functionDefinitions)

```


## Streams & Parsers
We provide a set of utilities to help you work with the streams returned by the api. As well as the parsers we use internally to parse the api's response.

The agent creators implement these tools internally, so you don't need to use them directly unless you are working directly with the OpenAi api.

**Stream Utilities:**

```ts
import { OaiStream } from '@hackdance/agents';

const stream = await fetch("https://api.openai.com/completion", { ...options })
const parsedStream = OaiStream(stream)
// default usage returns a stream of strings
// if a function response, returns the function arguments directly
// can be used with standard completions as well as streams.
```


**Auto parser**
```ts
import { OaiStream } from '@hackdance/agents';

const stream = await fetch("https://api.openai.com/completion", { ...options })
const parsedStream = OaiStream(stream)
// default usage returns a stream of strings
// if a function response, returns the function arguments directly
// can be used with standard completions as well as streams.
```

**Default parser**
```ts
import { OAIResponseTextParser } from '@hackdance/agents';

const stream = await fetch("https://api.openai.com/completion", { ...options })
const textStream = OAIResponseTextParser(stream)
```

**Function parser**
```ts
import { OAIResponseFnArgsParser } from '@hackdance/agents';

const stream = await fetch("https://api.openai.com/completion", { ...options })
const argumentsStream = OAIResponseFnArgsParser(stream)
```


## Misc Utilities


**Async queue**
Basic first in first out queue. Useful for managing async operations.

```ts
import { AsyncQueue } from '@hackdance/agents';
 const queue = new AsyncQueue<number>();
 queue.push(1);
 queue.push(2);

 for await (const value of queue) {
  console.log(value);
 }
 ```


**Log Generator**

```ts
// somewhere in your async code
import { LogGenerator } from '@hackdance/agents';

export const myAsyncLogs = new LogGenerator();

async function MyAsyncFunction() {
  // all your business logic
  myAsyncLogs.write({
    log: `Starting async operation ${currentOperation + 1}`
  })
}
 ```

```ts
//elsewhwere in your code, probaby where u start the async operation
import { myAsyncLogs, MyAsyncFunction } from './async-thing';

const startLogs = async () => {
  myAsyncLogs.startReading()
  for await (const { log } of myAsyncLogs.read()) {
    console.log(log)

    if (!myAsyncLogs.isReading()) {
      break
    }
  }
}


const operation = await Promise.all([startLogs(), MyAsyncFunction()])
myAsyncLogs.stopReading()
 ```
