/**
 * *****************************************************************************
 *
 * btoa algorithm
 *
 * Convert Binary to Assii 
 *
 * @param {string|buffer} data support buffer or string data
 * @return {buffer}
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';
import { Buffer } from '../Buffer.mjs';

// The Base64 Alphabet
const b64a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const b64code  = [...b64a].map(v => v.charCodeAt(0));

export const btoa = globalThis.btoa ? globalThis.btoa : btoaFn;

export function btoaFn (data) {

  const isBuffer = data instanceof Uint8Array; // test param is a buffer
  const pad = data.length % 3;
  const length = pad === 0 ? data.length : data.length + 3 - pad;
  const buffer = new Buffer(length / 3 * 4);

  const a = [];
  let   b = 0; // 

  const update = () => {
    // transform 3 byte data to a 24bits data;
    const b24 = ((a.shift() << 16) | (a.shift() << 8) | a.shift() << 0) & 0xFFFFFF;

    buffer[b++] = b64code[b24 >>> 18 & 0x3F];
    buffer[b++] = b64code[b24 >>> 12 & 0x3F];
    buffer[b++] = b64code[b24 >>> 6  & 0x3F];
    buffer[b++] = b64code[b24        & 0x3F];
  }

  // iterator all byte of data
  for (const v of data) {
    const code = isBuffer ? v : v.charCodeAt(0);
    assert(code < 255, `Invalid charactor ${v}.`);
    a.push(code); // push code
    if (a.length === 3) update();
  }

  if (a.length > 0) update();
  
  if (pad >= 1 ) buffer[buffer.length - 1] = 0x3D;
  if (pad === 1) buffer[buffer.length - 2] = 0x3D;

  return buffer;
}
