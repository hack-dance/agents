# @hackdance/agents

## 1.0.2

### Patch Changes

- [`9a32e8a`](https://github.com/hack-dance/agents/commit/9a32e8a36a1c95681455a45e3890570da97b6a11) Thanks [@roodboi](https://github.com/roodboi)! - updating readmes and urls to point to new project

## 1.0.1

### Patch Changes

- [`eae1521`](https://github.com/hack-dance/agents/commit/eae1521c398ce527f4a14d84778f9bdeff9fec49) Thanks [@roodboi](https://github.com/roodboi)! - ensure oai client config passes through from schema agent creation

## 1.0.0

### Major Changes

- [#52](https://github.com/hack-dance/agents/pull/52) [`29a69df`](https://github.com/hack-dance/agents/commit/29a69df3d4b68cd8c39051bd06ef267675eb9c2a) Thanks [@roodboi](https://github.com/roodboi)! - Moving to calling functions using tools since functions direct has been deprecated

## 0.1.0

### Minor Changes

- [#39](https://github.com/hack-dance/agents/pull/39) [`562cb18`](https://github.com/hack-dance/agents/commit/562cb18e3c6fa4a0ec0d939dbfe4038dc71ac078) Thanks [@roodboi](https://github.com/roodboi)! - Updated the schema agent to use the description value from .describe or { description: ""} in zod vs "message" + added the raw schema checks right into the description - eventually we should map to the right properties in the json schema format, but this at least ensures we are passing through the rules

## 0.0.1

### Patch Changes

- [#29](https://github.com/hack-dance/agents/pull/29) [`ed6015d`](https://github.com/hack-dance/agents/commit/ed6015d732b690f960045bdb500be7924f4d59ff) Thanks [@roodboi](https://github.com/roodboi)! - initial re-release of new package breakdown
