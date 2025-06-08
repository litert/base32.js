[Documents for @litert/base32](../../index.md) / [base32-js](../index.md) / stringToBase32

# Function: stringToBase32()

> **stringToBase32**(`data`): `string`

Defined in: [base32-js.ts:246](https://github.com/litert/base32.js/blob/master/src/lib/base32-js.ts#L246)

Encode a UTF-8 string into a BASE32-encoded string.

> This method transform the input string into a `Buffer`, and then calls `bufferToBase32`.

## Parameters

### data

`string`

The string to be encoded.

## Returns

`string`

The BASE32-encoded string.

## See

https://datatracker.ietf.org/doc/html/rfc4648#section-6
