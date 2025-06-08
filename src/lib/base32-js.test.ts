import * as NodeFS from 'node:fs';
import * as NodeCrypto from 'node:crypto';
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert'
import * as JsEnc from './base32-js';

const stringTestCases: Array<[string, string]> = [
    ['1', 'GE======'],
    ['12', 'GEZA===='],
    ['123', 'GEZDG==='],
    ['1234', 'GEZDGNA='],
    ['12345', 'GEZDGNBV'],
    ['123456', 'GEZDGNBVGY======'],
    ['1234567', 'GEZDGNBVGY3Q===='],
    ['12345678', 'GEZDGNBVGY3TQ==='],
    ['123456789', 'GEZDGNBVGY3TQOI='],
    ['1234567890', 'GEZDGNBVGY3TQOJQ'],
    ['你', '4S62A==='],
    ['你好', '4S62BZNFXU======'],
    ['我爱你', '42EJDZ4IWHSL3IA='],
];

NodeTest.describe('Native JavaScript Edition', async () => {

    NodeTest.it('API stringToBase32', () => {

        NodeAssert.equal(JsEnc.stringToBase32(''), '');

        for (const [origin, encoded] of stringTestCases) {

            NodeAssert.equal(JsEnc.stringToBase32(origin), encoded);
        }
    });

    NodeTest.it('API stringFromBase32', () => {

        NodeAssert.equal(JsEnc.stringFromBase32(''), '');

        for (const [origin, encoded] of stringTestCases) {

            NodeAssert.equal(JsEnc.stringFromBase32(encoded), origin);
        }
    });

    NodeTest.it('API bufferToBase32', () => {

        NodeAssert.equal(JsEnc.bufferToBase32(Buffer.alloc(0)), '');

        for (const [origin, encoded] of stringTestCases) {

            NodeAssert.equal(JsEnc.bufferToBase32(Buffer.from(origin)), encoded);
        }
    });

    NodeTest.it('API bufferFromBase32', () => {

        NodeAssert.equal(JsEnc.bufferFromBase32('').toString(), '');

        for (const [origin, encoded] of stringTestCases) {

            NodeAssert.equal(JsEnc.bufferFromBase32(encoded).toString(), origin);
        }

        NodeAssert.throws(() => JsEnc.bufferFromBase32('1'));
        NodeAssert.throws(() => JsEnc.bufferFromBase32('12'));
        NodeAssert.throws(() => JsEnc.bufferFromBase32('123'));
        NodeAssert.throws(() => JsEnc.bufferFromBase32('1234'));
        NodeAssert.throws(() => JsEnc.bufferFromBase32('12345'));
        NodeAssert.throws(() => JsEnc.bufferFromBase32('123456'));
        NodeAssert.throws(() => JsEnc.bufferFromBase32('1234567'));
    });

    NodeTest.it('should encode and decode test data correctly', () => {

        const bufferTestCases: Array<Record<'base64url' | 'base32', string>> = JSON.parse(
            NodeFS.readFileSync(`${__dirname}/../test-data/base32.json`, 'utf8')
        );

        for (const { base64url, base32 } of bufferTestCases) {
            const d = Buffer.from(base64url, 'base64url');
            NodeAssert.strictEqual(JsEnc.bufferToBase32(d), base32);
            NodeAssert.strictEqual(JsEnc.bufferFromBase32(base32).equals(d), true);
        }
        
        NodeAssert.equal(
            JsEnc.bufferFromBase32('B4PSUNCFJMQCUEBGEEFSYCTD')
                .equals(Buffer.from('Dx8qNEVLICoQJiELLApj', 'base64url')),
            true
        );

        JsEnc.bufferFromBase32('abc23456'.repeat(65537));
    });

    NodeTest.it('should encode and decode large data correctly', () => {

        // to test the allocation of new memory pages in the wasm module
        for (let i = 0; i < 0x10000 * 5; i += Math.floor(Math.random() * 10240)) {

            const randomString = NodeCrypto.randomBytes(i);
            const encoded = JsEnc.bufferToBase32(randomString);
            NodeAssert.strictEqual(JsEnc.bufferFromBase32(encoded).equals(randomString), true);
        }
    });

});
