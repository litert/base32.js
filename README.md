# LiteRT/BASE32

[![npm version](https://img.shields.io/npm/v/@litert/base32.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/base32 "Stable Version")
[![License](https://img.shields.io/npm/l/@litert/base32.svg?maxAge=2592000?style=plastic)](https://github.com/litert/base32/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/litert/base32.js.svg)](https://github.com/litert/base32.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/base32.js.svg)](https://github.com/litert/base32.js/releases "Stable Release")

The encoding and decoding library for BASE32, in Node.js.

> WebAssembly implementation included, which could be also used in the browser.

## Installation

```sh
npm i @litert/base32 --save
```

## Quick Start

Use the library in Node.js like this:

> The default export is the WebAssembly implementation.

```ts
import * as Base32 from "@litert/base32";

const b32 = Base32.stringToBase32('Hello, 世界!');

console.log('Base32 Encoded:', b32);

const decoded = Base32.stringFromBase32(b32);

console.log('Base32 Decoded:', decoded);
```

## Documents

- [en-us](https://litert.org/projects/base32.js/)

## License

This library is published under [Apache-2.0](./LICENSE) license.
