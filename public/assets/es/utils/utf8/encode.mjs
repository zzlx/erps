/**
 * *****************************************************************************
 *
 * convert unicode to utf8code
 *
 * @param {array} bin
 * @return {array}
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';
import { Buffer } from '../Buffer.mjs';

export function encode (unicode) {
  const isString = typeof unicode === 'string';
  const u8a = [];

  for (const c of unicode) {
    const u = isString ? c.charCodeAt(0) : typeof c === 'number' ? c : null;
    assert(u != null, `${u} is invalid.`);

    if (u <= 0x7F) {
      u8a.push(u);
    } else if (u <= 0x7FF) {
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
