> [!WARNING]
> The agents and hooks packages are no longer maintained and schema-stream has moved here: [island-ai](https://github.com/hack-dance/island-ai)
> Agents has been mostly replaced by zod-stream and the hooks package has moved to stream-hooks - now both part of the island-ai project.


# @hackdance/hooks

This package provides three custom React hooks for managing streams, chat streams, and JSON streams.

## Installation

To install the package, run the following command:

```bash
  pnpm add @hackdance/hooks
```

## Hooks

### useStream

`useStream` is a custom React hook that manages a stream. It provides functionalities to start and stop the stream.

#### Props

| Name          | Type     | Description |
| ------------- | -------- | ----------- |
| onBeforeStart | function | Optional callback function that will be invoked before the stream starts. |
| onStop        | function | Optional callback function that will be invoked when the stream stops. |

#### Usage

```jsx
  import { useStream } from '@hackdance/hooks';

  const { startStream, stopStream } = useStream({ onBeforeStart: ..., onStop: ... });
```


### useChatStream

`useChatStream` is a custom React hook that extends the `useStream` hook to manage a chat stream. It provides functionalities to start and stop the chat stream, manage the chat messages, and manage the loading state.

#### Props

| Name             | Type     | Description |
| ---------------- | -------- | ----------- |
| onReceive        | function | Optional callback function that will be invoked when a message is received. |
| onEnd            | function | Optional callback function that will be invoked when the chat stream ends. |
| startingMessages | array    | Optional array of starting messages. |
| ctx              | object   | Optional static context object, appended to every post body on each startStream invocation . |
| defaultMethod | string | Optional method for the request, one of GET | POST defaults to POST. |
| defaultHeaders | object | Optional request headers |

#### Usage

```jsx
  import { useChatStream } from '@hackdance/hooks'

  const { loading, startStream, stopStream, messages, setMessages } = useChatStream({ onBeforeStart: ..., onReceive: ..., onEnd: ..., startingMessages: [] })
```
#### startStream

`startStream` is a function that starts a stream with the provided arguments and parses the incoming stream into JSON. It takes an object as an argument with the following properties:

| Name    | Type   | Description |
| ----    | ------ | ----------- |
| url     | string | The URL of the stream. |
| prompt  | string | A string prompt included in the  post body on the request to your url. |
| ctx     | object | Optional context object, sent in the post body on the request to your url. |
| method | string | Optional method for the request, one of GET | POST defaults to POST. |
| headers | object | Optional request headers |

Example:

```jsx
  startStream({ url: 'http://example.com', prompt: "hey there", ctx: { key: 'value' } });
```

#### stopStream

`stopStream` is a function that stops the stream. It doesn't take any arguments.

Example:
```jsx
  stopStream();
```



### useJsonStream

`useJsonStream` is a custom React hook that extends the `useStream` hook to add JSON parsing functionality. It uses the `SchemaStream` to parse the incoming stream into JSON.

#### Props

| Name      | Type     | Description |
| --------- | -------- | ----------- |
| onReceive | function | Optional callback function that will be invoked when a JSON object is received. |
| onEnd     | function | Optional callback function that will be invoked when the JSON stream ends. |
| schema    | z.ZodObject   | The zod schema for the JSON data, the top level must be an object. |
| ctx       | object   | Optional static context object, appended to every post body on each
startStream invocation . |
| defaultMethod | string | Optional method for the request, one of GET | POST defaults to POST. |
| defaultHeaders | object | Optional request headers |

#### Usage

```jsx
  import { useJsonStream } from '@hackdance/hooks';

  const { loading, startStream, stopStream, json } = useJsonStream({ onBeforeStart: ..., onReceive: ..., onStop: ..., onEnd: ..., schema: ..., ctx: {} });
```

#### startStream

`startStream` is a function that starts a stream with the provided arguments and parses the incoming stream into JSON. It takes an object as an argument with the following properties:

| Name | Type   | Description |
| ---- | ------ | ----------- |
| url  | string | The URL of the stream. |
| ctx  | object | Optional context object, sent in the post body to your url. |
| method | string | Optional method for the request, one of GET | POST defaults to POST. |
| headers | object | Optional request headers |

Example:

```jsx
  startStream({ url: 'http://example.com', ctx: { key: 'value' } });
```

#### stopStream

`stopStream` is a function that stops the stream. It doesn't take any arguments.

Example:
```jsx
  stopStream();
```

## License

MIT
