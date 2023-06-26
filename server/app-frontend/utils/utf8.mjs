/**
 * *****************************************************************************
 *
 * UTF8
 *
 * [RFC3629](https://www.rfc-editor.org/info/rfc3629)
 *
 * *****************************************************************************
 */

import { Buffer } from './Buffer.mjs';

export const utf8 = {
  encode: unicode_to_utf8,
  decode: utf8_to_unicode,
  parse: unicode_to_utf8,
}

/**
 *
 * convert unicode to utf8code
 *
 * @param {array} bin
 * @return {array}
 */

export function unicode_to_utf8 (bin) {
  const isString = typeof bin === 'string';
  const u8a = [];

  //for (let i = 0; i < bin.length; i++) {
  for (const c of bin) {
    //const c = bin[i];
    const u = isString ? c.charCodeAt(0) : c;
    if (typeof(u) !== 'number') throw new Error(`Invalid code ${u}.`);

    if (u < 0x80) { // ascii char 0~0x7F
      u8a.push(u);
    } else if (u < 0x800) {
      let c0 = u >> 6         | 0xC0;
      let c1 = u       & 0x3F | 0x80;

      u8a.push(c0, c1);
    } else if (u <= 0xFFFF) {
      let c0 = u >> 12        | 0xE0;
      let c1 = u >> 6  & 0x3F | 0x80;
      let c2 = u       & 0x3F | 0x80;

      u8a.push(c0, c1, c2);
    } else if (u <= 0x1FFFFF) {
      let c0 = u >> 18        | 0xF0;
      let c1 = u >> 12 & 0x3F | 0x80;
      let c2 = u >> 6  & 0x3F | 0x80;
      let c3 = u       & 0x3F | 0x80;

      u8a.push(c0, c1, c2, c3);
    } else {
      throw new Error(`Invalid Unicode: ${c}`);
    }
  }

  return new Buffer(u8a);
}
/**
 *
 * Convert utf8 to unicode
 * 
 *
 * [Unicode® 13.0.0](https://www.unicode.org/versions/Unicode13.0.0/)
 */

export function utf8_to_unicode (bin) {
  const isString = typeof bin === 'string';
  //for (const c of bin) u8a.push(c.charCodeAt(0));

  const u8 = [];

  for (let i = 0; i < bin.length; i++) {

    if (bin[i] >>> 7 === 0b0) {
      u8.push(bin[i]);
      continue;
    }

    if (bin[i] >>> 5 === 0b110) {
      u8.push((bin[i] << 27 >>> 21) | (bin[++i] << 26 >>> 26));
      continue;
    } 

    if (bin[i] >>> 4 === 0b1110) {
      u8.push(
        (bin[i] << 28 >>> 16) | (bin[++i] << 26 >>> 20) | (bin[++i] << 26 >>> 26)
      );
      continue;
    } 

    if (bin[i] >>> 3 === 0b11110) {
      u8.push(
        (bin[i] << 29 >>> 11)   | (bin[++i] << 26 >>> 14) | 
        (bin[++i] << 26 >>> 20) | (bin[++i] << 26 >>> 26)
      );
      continue;
    } 

    throw new Error(`Invalid utf8 encode: ${String.fromCharCode(bin[i])}`);
  }

  return String.fromCharCode(...u8);
}
