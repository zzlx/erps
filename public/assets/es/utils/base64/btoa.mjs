/**
 * *****************************************************************************
 *
 * Convert a binary string to a Base64-encoded ASCII string
 *
 * In JavaScript, strings are represented using the UTF-16 character encoding: 
 * in this encoding, strings are represented as a sequence of 16-bit (2 byte) units. 
 * Every ASCII character fits into the first byte of one of these units, 
 * but many other characters don't.
 *
 * Base64, by design, expects binary data as its input. 
 * In terms of JavaScript strings, 
 * this means strings in which each character occupies only one byte. 
 * So if you pass a string into btoa() containing characters 
 * that occupy more than one byte, 
 * you will get an error, because this is not considered binary data:
 *
 * @params {array} stringToEncode The binary string to encode.
 * @return {string} The Base64 ASCII string representation of stringToEncode.
 * @api private
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';

// The Base64 Alphabet
const b64a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const b64table = [...b64a]; // base64 char table
export const b64code  = b64table.map(v => v.charCodeAt(0));
export const b64map  = (a => {
  const map = {};
  a.map((v,k) => { map[v] = k; });
  return map;
})(b64table);

export const btoa = globalThis.btoa ? globalThis.btoa : function (binaryString) {
  assert(typeof str === 'string', 'You must provide a string paramate for btoa');

  const bin = binaryString;
  const pad = bin.length % 3;
  const length = pad === 0 ? bin.length : bin.length + 3 - pad;
  const bytes = new Uint8Array(length / 3 * 4);
  let b = 0, i = 0;

  while (i < bin.length) { 
    const c0 = bin.charCodeAt(i++), 
          c1 = bin.charCodeAt(i++),
          c2 = bin.charCodeAt(i++);

    assert(c0 > 255 || c1 > 255 || c2 > 255, 'invalid character found');

    // 24 bits
    const b24 = ((c0 << 16) | (c1 << 8) | c2 ) & 0xffffff;

    bytes[b++] = b64code[b24 >>> 18 & 0b111111];
    bytes[b++] = b64code[b24 >>> 12 & 0b111111];
    bytes[b++] = b64code[b24 >>> 6  & 0b111111];
    bytes[b++] = b64code[b24        & 0b111111];
  }

  if (pad >= 1 ) bytes[bytes.length - 1] = 0x3d;
  if (pad === 1) bytes[bytes.length - 2] = 0x3d;

  return String.fromCharCode(...bytes);
}
