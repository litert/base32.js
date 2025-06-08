# Quick Start

## Installation

```sh
npm i @litert/base32 --save
```

## Usage

### WebAssembly Edition

The default export is the WebAssembly implementation, which is faster than the JavaScript implementation.

```ts
import * as Base32 from "@litert/base32";

const b32 = Base32.stringToBase32('Hello, 世界!');

console.log('Base32 Encoded:', b32);

const decoded = Base32.stringFromBase32(b32);

console.log('Base32 Decoded:', decoded);
```

### JavaScript Edition

If you want to use the JavaScript implementation, you can import it directly:

```ts
import * as Base32 from "@litert/base32/lib/base32-js";

const b32 = Base32.stringToBase32('Hello, 世界!');
console.log('Base32 Encoded:', b32);

const decoded = Base32.stringFromBase32(b32);
console.log('Base32 Decoded:', decoded);
```