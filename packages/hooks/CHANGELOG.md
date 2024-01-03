# @hackdance/hooks

## 3.0.0

### Patch Changes

- Updated dependencies [[`7154c1b`](https://github.com/hack-dance/agents/commit/7154c1b5883015bd9244189d7396ce530732dd13)]:
  - schema-stream@1.2.0

## 2.0.0

### Minor Changes

- [#47](https://github.com/hack-dance/agents/pull/47) [`906a0b9`](https://github.com/hack-dance/agents/commit/906a0b9c90228ccfa14ab0c4e1961f60a5cc5ca3) Thanks [@roodboi](https://github.com/roodboi)! - add new options for string buffer size and hadnling of unescaped new lines

### Patch Changes

- Updated dependencies [[`906a0b9`](https://github.com/hack-dance/agents/commit/906a0b9c90228ccfa14ab0c4e1961f60a5cc5ca3)]:
  - schema-stream@1.1.0

## 1.0.0

### Major Changes

- [#45](https://github.com/hack-dance/agents/pull/45) [`76342d4`](https://github.com/hack-dance/agents/commit/76342d4c40eee773887564432c97f931785ace33) Thanks [@roodboi](https://github.com/roodboi)! - Forked the json parser package instead of t rying to work around it - updated props and things to accept default data and am now returning a few things like activeKey

### Patch Changes

- Updated dependencies [[`76342d4`](https://github.com/hack-dance/agents/commit/76342d4c40eee773887564432c97f931785ace33)]:
  - schema-stream@1.0.0

## 0.2.0

### Minor Changes

- [`aa443a9`](https://github.com/hack-dance/agents/commit/aa443a9336664816c84582ee68dff3b239dd7083) Thanks [@roodboi](https://github.com/roodboi)! - Change error thrown from stream call to jsut be the response error unless we have an abort signal

## 0.1.1

### Patch Changes

- [`38c1770`](https://github.com/hack-dance/agents/commit/38c17700b1e0eda0013f7d98dec970be1e7b4509) Thanks [@roodboi](https://github.com/roodboi)! - hot fix for GET requests, to not include the body

## 0.1.0

### Minor Changes

- [#41](https://github.com/hack-dance/agents/pull/41) [`44b117d`](https://github.com/hack-dance/agents/commit/44b117dbd270eaca14bfa295cb5bdfe06a645e51) Thanks [@roodboi](https://github.com/roodboi)! - Updated hooks apis to accept headers and body and deprecated context on the startStream methods - ctx will still pass through as default on the use invocation

## 0.0.6

### Patch Changes

- Updated dependencies [[`408b0c7`](https://github.com/hack-dance/agents/commit/408b0c746a93bdc800cbe09363995408d1df94d7)]:
  - schema-stream@0.0.2

## 0.0.5

### Patch Changes

- [`f987f68`](https://github.com/hack-dance/agents/commit/f987f680a29b95d4df2c0e3060eeca1320743a12) Thanks [@roodboi](https://github.com/roodboi)! - Update the order of the onEnd call

## 0.0.4

### Patch Changes

- [#35](https://github.com/hack-dance/agents/pull/35) [`1d95f29`](https://github.com/hack-dance/agents/commit/1d95f29a0ed209228cbbd729be6bb372a57b9c1b) Thanks [@roodboi](https://github.com/roodboi)! - Update loading switch and use a ref to make sure were working on the right value

## 0.0.3

### Patch Changes

- [#33](https://github.com/hack-dance/agents/pull/33) [`cbeec8b`](https://github.com/hack-dance/agents/commit/cbeec8bfe8ef85cae14f42d88f13d66d9f7e2795) Thanks [@roodboi](https://github.com/roodboi)! - Updating json hook to support context properly, provide a loading state and be more in line with the stream hook it extends

## 0.0.2

### Patch Changes

- [#31](https://github.com/hack-dance/agents/pull/31) [`0592c21`](https://github.com/hack-dance/agents/commit/0592c212a86586551845db8b31b5059c75ce490d) Thanks [@roodboi](https://github.com/roodboi)! - Added onEnd callback to the use json stream hook

## 0.0.1

### Patch Changes

- [#29](https://github.com/hack-dance/agents/pull/29) [`ed6015d`](https://github.com/hack-dance/agents/commit/ed6015d732b690f960045bdb500be7924f4d59ff) Thanks [@roodboi](https://github.com/roodboi)! - initial re-release of new package breakdown

- Updated dependencies [[`ed6015d`](https://github.com/hack-dance/agents/commit/ed6015d732b690f960045bdb500be7924f4d59ff)]:
  - schema-stream@0.0.1
