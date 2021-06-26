/**
 * *****************************************************************************
 *
 * bitwise mask 
 *
 * @param {buffer} data
 * @param {buffer} key
 * @param {function} opFn
 * @return {buffer}
 *
 * *****************************************************************************
 */

import { assert } from './assert.mjs';
import { Buffer } from './Buffer.mjs';

export function bitMask (data, maskKey, fn) {
  assert(data instanceof Uint8Array, `Process data must be a Uint8Array object.`);
  assert(maskKey instanceof Uint8Array, `key must be a Uint8Array object.`);

  const payload  = new Buffer(data.length);

  let it = maskKey[Symbol.iterator]();
  let i = 0;
  
  for (const b of data) { // byte
    let v = it.next();
    if (v.done === true) { it = maskKey[Symbol.iterator](); v = it.next(); }
    payload[i++] = b ^ v.value;
  }

  return payload;
}
