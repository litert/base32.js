[Documents for @litert/base32](../../index.md) / [base32-wasm](../index.md) / bufferFromBase32

# Variable: bufferFromBase32()

> `const` **bufferFromBase32**: (`input`) => `Buffer`

Defined in: [base32-wasm.ts:179](https://github.com/litert/base32.js/blob/master/src/lib/base32-wasm.ts#L179)

Decode a BASE32-encoded string into a `Buffer`.

## Parameters

### input

`string`

The BASE32-encoded string to be decoded.

## Returns

`Buffer`

The decoded `Buffer`.

## Throws

`RangeError` if the input is not a valid BASE32-encoded string.

## See

https://datatracker.ietf.org/doc/html/rfc4648#section-6
