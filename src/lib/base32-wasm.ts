/**
 * Copyright 2025 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as NodeFS from 'node:fs';

let wasmModule: WebAssembly.Module;

interface IWasmApis {

    readonly memory: WebAssembly.Memory;

    initTable(): void;

    getReserverMemorySize(): number;

    encode(len: number): number;

    decode(len: number): number;
}

/**
 * The encoder (and also the decoder) for base32 encoding,
 * written in WebAssembly.
 */
class WasmBase32Encoder {

    /**
     * Allocated pages for the WebAssembly memory.
     * The initial value is 1, which means 64K memory is allocated.
     *
     * > A page in WebAssembly is 64 KiB (65536 bytes).
     */
    private _allocPages: number = 1;

    private readonly _wasmInst: WebAssembly.Instance;

    private readonly _apis: IWasmApis;

    public constructor() {

        wasmModule ??= new WebAssembly.Module(NodeFS.readFileSync(`${__dirname}/../wasm/base32.wasm`));

        this._wasmInst = new WebAssembly.Instance(wasmModule, {});

        this._apis = this._wasmInst.exports as unknown as IWasmApis;

        this._apis.memory.grow(1); // Allocate 64K memory for the first time.

        this._apis.initTable();
    }

    public bufferToBase32(data: Buffer): string {

        const RMS = this._apis.getReserverMemorySize();

        // Prepare memory for decoding: RMS + input length + expected output length.
        // The expected output length is 8/5 of the input length.
        // Then the most safe way is just using the 2x (10/5, 200%) as the expected output length,
        // So, the final memory size will be: RMS + input length * 2 + input length.
        const minMemPages = Math.ceil((RMS + data.byteLength * 3) / 65536);

        if (minMemPages > this._allocPages) {

            this._apis.memory.grow(minMemPages - this._allocPages);
            this._allocPages = minMemPages;
        }

        data.copy(Buffer.from(this._apis.memory.buffer, RMS, data.byteLength));
        const outLength = this._apis.encode(data.byteLength);
        return Buffer.from(this._apis.memory.buffer, RMS + data.byteLength, outLength).toString('utf8');
    }

    public bufferFromBase32(input: string): Buffer {

        const RMS = this._apis.getReserverMemorySize();
        const inLength = Buffer.byteLength(input);

        // Prepare memory for decoding: RMS + input length + expected output length.
        // The expected output length is 5/8 of the input length.
        // So, to simplify the calculation, just use the same as the expected output length,
        // So, the final memory size will be: RMS + input length * 2.
        const minMemPages = Math.ceil((inLength * 2 + RMS) / 65536);

        if (minMemPages > this._allocPages) {

            this._apis.memory.grow(minMemPages - this._allocPages);
            this._allocPages = minMemPages;
        }

        // copy the input string to the wasm memory (starting from RMS, ending at RMS + inLength).
        Buffer.from(this._apis.memory.buffer, RMS, inLength).write(input);

        const outLength = this._apis.decode(inLength);
        if (outLength < 0) {

            throw new TypeError('Invalid input data for base32 encoding.');
        }

        // read the result from the wasm memory (starting from RMS + inLength, ending at RMS + inLength + outLength).
        return Buffer.from(this._apis.memory.buffer, RMS + inLength, outLength);
    }

    public stringToBase32(data: string): string {

        return this.bufferToBase32(Buffer.from(data));
    }

    public stringFromBase32(data: string): string {

        return this.bufferFromBase32(data).toString();
    }
}

const enc = new WasmBase32Encoder();

/**
 * Encode a UTF-8 string into a BASE32-encoded string.
 *
 * > This method transform the input string into a `Buffer`, and then calls `bufferToBase32`.
 *
 * @param data  The string to be encoded.
 *
 * @returns     The BASE32-encoded string.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc4648#section-6
 */
export const stringToBase32 = enc.stringToBase32.bind(enc);

/**
 * Decode a BASE32-encoded string into a UTF-8 string.
 *
 * > This method calls `bufferFromBase32` to decode the input string into a `Buffer`, and then
 * > converts it to a UTF-8 string.
 *
 * @param data  The BASE32-encoded string to be decoded.
 *
 * @returns     The decoded UTF-8 string.
 *
 * @throws `RangeError` if the input is not a valid BASE32-encoded string.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc4648#section-6
 */
export const stringFromBase32 = enc.stringFromBase32.bind(enc);

/**
 * Encode a `Buffer` to a BASE32-encoded string.
 *
 * @param data  The `Buffer` to be encoded.
 *
 * @returns     The BASE32 encoded string.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc4648#section-6
 */
export const bufferToBase32 = enc.bufferToBase32.bind(enc);

/**
 * Decode a BASE32-encoded string into a `Buffer`.
 *
 * @param input  The BASE32-encoded string to be decoded.
 *
 * @returns        The decoded `Buffer`.
 *
 * @throws `RangeError` if the input is not a valid BASE32-encoded string.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc4648#section-6
 */
export const bufferFromBase32 = enc.bufferFromBase32.bind(enc);
