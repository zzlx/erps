/**
 * *****************************************************************************
 *
 * Convert ascii to binary
 *
 * [RFC 2045~2049](https://www.rfc-editor.org/rfc/rfc2045)
 *
 * @param {string|buffer} bin
 * @return {buffer}
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';
import { Buffer } from '../Buffer.mjs';

const b64a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const b64map  = (() => {
  const map = {};
  [...b64a].map((v, k) => { map[v] = k; });
  return map;
})();

export const atob = globalThis.atob ? globalThis.atob : atobFn;

export function atobFn (data) {
  assert(data.length % 4 === 0, `The data param is invalid.`);
  const isBuffer = data instanceof Uint8Array; // test param is a buffer
  let extraByte = 0;
  if (data[data.length - 1] === '=') extraByte = 1;
  if (data[data.length - 2] === '=') extraByte = 2;
  const bufferLength = data.length/4*3 - extraByte;
  const buffer = new Buffer(bufferLength);

  const a = [];
  let   b = 0; 

  const update = () => {
    const b24 = b64map[a.shift()] << 18
              | b64map[a.shift()] << 12
              | b64map[a.shift()] << 6
              | b64map[a.shift()] << 0;

    buffer[b++] = b24 >>> 16 & 0xFF;
    buffer[b++] = b24 >>> 8  & 0xFF;
    buffer[b++] = b24        & 0xFF;
  }

  for (const v of data) {
    const char = isBuffer ? String.fromCharCode(v) : v;
    assert(b64map[char] || char === '=', `Invalid char ${char}`)
    a.push(char);
    if (a.length === 4) update();
  }

  return buffer;
}
