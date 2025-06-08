[Documents for @litert/base32](../../index.md) / [base32-wasm](../index.md) / stringFromBase32

# Variable: stringFromBase32()

> `const` **stringFromBase32**: (`data`) => `string`

Defined in: [base32-wasm.ts:155](https://github.com/litert/base32.js/blob/master/src/lib/base32-wasm.ts#L155)

Decode a BASE32-encoded string into a UTF-8 string.

> This method calls `bufferFromBase32` to decode the input string into a `Buffer`, and then
> converts it to a UTF-8 string.

## Parameters

### data

`string`

The BASE32-encoded string to be decoded.

## Returns

`string`

The decoded UTF-8 string.

## Throws

`RangeError` if the input is not a valid BASE32-encoded string.

## See

https://datatracker.ietf.org/doc/html/rfc4648#section-6
