/**
 * *****************************************************************************
 *
 * Buffer 对象
 *
 * *****************************************************************************
 */

import { HEX_MAP, byteToHex } from './byteToHex.mjs';
import { utf8 } from './utf8.mjs';

const f32a = new Float32Array([-1]); // 0xBF800000
const u8a  = new Uint8Array(f32a.buffer);
const bigEndian = u8a[3] === 0;

export class Buffer extends Uint8Array {
  constructor () {
    super(...arguments);
  }

  toJSON () {
    const data = new Array(this.length);
    for (let i = 0; i < this.length; i++) data[i] = this[i];
    return { type: 'Buffer', data: data, }
  }

  toString (encoding, start, end) {


    if (encoding === 'hex') return [...this].map(byteToHex).join('');
    if (encoding === 'utf8') return utf8.decode(this);
    return String.fromCharCode(...this);
  }
}

Buffer.from = function (string, encoding) {
  if (typeof string === 'string') {
    if (encoding === 'hex') {
      string = string.toLowerCase();
      const a = [];

      for (let i = 0; i < string.length; i+=2) {
        const v1 = HEX_MAP[string[i]], v2 = HEX_MAP[string[i+1]];
        a.push(v1 << 4 | v2);
      }

      return new Buffer(Uint8Array.from(a));
    }

    return new Buffer(Uint8Array.from(utf8.encode(string))); 
  }

  return new Buffer(Uint8Array.from(...arguments)); 
}

Buffer.isBuffer = function (obj) {
  return obj instanceof Uint8Array;
}

Buffer.of = function () {
  return new Buffer(Uint8Array.of(...arguments)); 
}

/**
 * @param {string|buffer|integer} fill value to pre-fill the new buffer, default 0
 */

Buffer.alloc = function alloc (size, fill, encoding = 'utf8') {
  return new Buffer(...arguments);
}
