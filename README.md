# @hack-dance/agents
> Copy, Paste, AI: A modular toolkit for building more then just chat bots.

[docs](https://agents.hack.dance)

:information_source: **FYI**: These docs are a work in progress. For now, all code is in TypeScript and examples assume Next.js 13+. Feel free to reach out on Twitter or create an issue on GitHub if something is unclear or broken. More examples and framework integrations are coming soon. Thanks for your patience!

## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Chat Agent](#chat-agent)
- [Schema Agent](#schema-agent)
- [Streaming](#streaming)

## Introduction
A collection of AI utilities, hooks, and abstractions for building AI agents with OpenAI.

### This is not a Typical NPM Package
Inspired by the model introduced by [shadcn](https://ui.shadcn.com), this is not an npm package you'll add as a dependency. Instead, it is just a collection of utilities, hooks, and abstractions that you can directly integrate into your codebase.

### How Do I Use It?
1. **Select What You Need**: Explore the documentation and select the components that align with your project goals.
2. **Copy, Paste**: Copy the code into your project. This code is now yours—feel free to customize.
3. **CLI**: We provide a CLI that copies the parts of the toolkit you want, into your project.

### Why This Approach?
- **Complete Control**: Pick only what you need, avoid the bloat that comes with unwanted functionality.
- **Flexibility**: With the code integrated into your project, you have the freedom to modify and extend it as you wish.

## Installation

### Existing projects
Install the necessary dependencies:
```bash
pnpm add openai zod
```

Add the core agent utilities:
```bash
npx @hackdance/agents add --path=src
```

Optionally set up import aliases (if you do not have these improt aliases setup, you will have to manually change the paths in the copied code.):
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```
