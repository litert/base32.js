import * as Base32 from '../lib';
import * as Base32Js from "../lib/base32-js";

(() => {

    const b32 = Base32Js.stringToBase32('Hello, 世界!');
    console.log('Base32 Encoded:', b32);

    const decoded = Base32Js.stringFromBase32(b32);
    console.log('Base32 Decoded:', decoded);
})();

(() => {

    const b32 = Base32.stringToBase32('Hello, 世界!');

    console.log('Base32 Encoded:', b32);

    const decoded = Base32.stringFromBase32(b32);

    console.log('Base32 Decoded:', decoded);
})();
