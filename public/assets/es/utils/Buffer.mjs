/**
 * *****************************************************************************
 *
 * Buffer
 *
 * Buffer Object
 *
 * *****************************************************************************
 */

import { byteToHex } from './byteToHex.mjs';
import { decode } from './utf8/decode.mjs';
import { encode } from './utf8/encode.mjs';

export class Buffer extends Uint8Array {
  constructor () {
    super(...arguments);
  }

  toJSON () {
    return {
      type: 'Buffer',
      data: `[${[...this].join(',')}]`, 
    }
  }

  toString (format) {
    if (format === 'hex') return [...this].map(byteToHex).join('');
    if (format === 'utf8') return decode(this);
    return String.fromCharCode(...this);
  }
}

Buffer.from = function () {
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
