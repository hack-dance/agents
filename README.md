# @hack-dance/agents
> Copy, Paste, AI: A modular toolkit for building more then just chat bots.

[docs](https://agents.hack.dance)
[cli on npm](https://www.npmjs.com/package/@hackdance/agents-cli)

:information_source: **FYI**: These docs are a work in progress. For now, all code is in TypeScript and examples assume Next.js 13+. Feel free to reach out on Twitter or create an issue on GitHub if something is unclear or broken. More examples and framework integrations are coming soon. Thanks for your patience!

## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Chat Agent](#chat-agent)
- [Schema Agent](#schema-agent)
- [Streaming](#streaming)

## Introduction
A collection of AI utilities, hooks, and abstractions for building AI agents with OpenAI.

# Installation

Install the necessary dependencies with your package manager of choice.
```zsh
  pnpm add openai zod
```

## Standard install
Add the core agents package to your project

```zsh
  pnpm add @hackdance/agents-core
```

Add the hooks package to your project

```zsh
  pnpm add @hackdance/agents-hooks
```



## Copy & paste w/ cli
Add the core agent utilities and/or hooks using interactive CLI

```zsh
  npx @hackdance/agents-cli add --path=src
```

Optionally setup import aliases

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```


