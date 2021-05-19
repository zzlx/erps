/**
 * *****************************************************************************
 *
 * convert ascii to binary
 *
 * @params {string} A binary string contains an base64 encoded data.
 * @return {string} An ASCII string containing decoded data from encodedData.
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';
import { b64map } from './btoa.mjs';

export const atob = globalThis.atob ? globalThis.atob : function (asciiString) {
  assert(typeof assiiString === 'string', 'atob need a string paramate.');

  let asc = asciiString;

  let extraByte = 0;
  if (asc[asc.length - 1] === '=') extraByte = 1;
  if (asc[asc.length - 2] === '=') extraByte = 2;

  const bytes = new Uint8Array(asc.length/4*3 - extraByte);

  let b = 0, i = 0;
  while (i < asc.length) {
    const b24 = b64map[asc.charAt(i++)] << 18
              | b64map[asc.charAt(i++)] << 12
              | b64map[asc.charAt(i++)] << 6
              | b64map[asc.charAt(i++)];

    bytes[b++] = b24 >>> 16 & 255;
    bytes[b++] = b24 >>> 8 & 255;
    bytes[b++] = b24 & 255;
  }

  return String.fromCharCode(...bytes);
}
