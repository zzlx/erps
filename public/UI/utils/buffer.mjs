/**
 * *****************************************************************************
 *
 * Buffer
 *
 * *****************************************************************************
 */

export const buffer = {};

// Temporary buffers to convert numbers.
const float32Array = new Float32Array(1);
const uInt8Float32Array = new Uint8Array(float32Array.buffer);
const float64Array = new Float64Array(1);
const uInt8Float64Array = new Uint8Array(float64Array.buffer);

// Check endianness.
float32Array[0] = -1; // 0xBF800000
// Either it is [0, 0, 128, 191] or [191, 128, 0, 0]. It is not possible to
// check this with `os.endianness()` because that is determined at compile time.
const bigEndian = uInt8Float32Array[3] === 0;

class Buffer extends Uint8Array {
  constructor () {
    super();
  }


  swap32 () {
    // For Buffer.length < 192, it's generally faster to
    // do the swap in javascript. For larger buffers,
    // dropping down to the native code is faster.
    const len = this.length;
    if (len % 4 !== 0)
      throw new ERR_INVALID_BUFFER_SIZE('32-bits');
    if (len < 192) {
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    }

    return _swap32(this);
  }

  swap64 () {
    // For Buffer.length < 192, it's generally faster to
    // do the swap in javascript. For larger buffers,
    // dropping down to the native code is faster.
    const len = this.length;
    if (len % 8 !== 0)
      throw new ERR_INVALID_BUFFER_SIZE('64-bits');
    if (len < 192) {
      for (let i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    }
    return _swap64(this);
  }

  toString (encoding, start, end) {
    if (arguments.length === 0) {
      return this.utf8Slice(0, this.length);
    }

    const len = this.length;
    if (start <= 0) start = 0; 
    else if (start >= len) return ''; 
    else start |= 0;

    if (end === undefined || end > len) end = len;
    else end |= 0;

    if (end <= start) return '';

    if (encoding === undefined) return this.utf8Slice(start, end);

    const ops = getEncodingOps(encoding);
    if (ops === undefined) throw new ERR_UNKNOWN_ENCODING(encoding);

    return ops.slice(this, start, end);
  }

  toJSON () {
    if (this.length > 0) {
      const data = new Array(this.length);
      for (let i = 0; i < this.length; ++i) data[i] = this[i];
      return { type: 'Buffer', data };
    }

    return { type: 'Buffer', data: [] };
  }
}

Buffer.isBuffer = function (b) {
  return b instanceof Buffer
}

Buffer.of = function (...items) {
  const newObj = createUnsafeBuffer(items.length);
  for (let k = 0; k < items.length; k++) newObj[k] = items[k];
  return newObj;
}

/**
 * convert unicode to utf8code
 *
 * @param {array} bin
 * @return {array}
 */

function unicode_to_utf8 (bin) {
  const u8a = [];

  for (let b32 of bin) {

    if (typeof(b32) === 'string') b32 = b32.charCodeAt(0);
    if (typeof(b32) !== 'number') throw new Error('Invalid code');

    if (b32 < 0x80) {
      u8a.push(b32);
    } else if ((b32 > 0x7F) && (b32 < 0x800)) {

      let c0 = b32 >> 6             | 0b11000000;
      let c1 = b32       & 0b111111 | 0b10000000;

      u8a.push(c0, c1);
    } else if ((b32 > 0x7FF) && (b32 < 0x10000)) {

      let c0 = b32 >> 12            | 0b11100000;
      let c1 = b32 >> 6  & 0b111111 | 0b10000000;
      let c2 = b32       & 0b111111 | 0b10000000;

      u8a.push(c0, c1, c2);
    } else if ((b32 > 0xFFFF) && (b32 < 0x110000)) {

      let c0 = b32 >> 18            | 0b11110000;
      let c1 = b32 >> 12 & 0b111111 | 0b10000000;
      let c2 = b32 >> 6  & 0b111111 | 0b10000000;
      let c3 = b32       & 0b111111 | 0b10000000;

      u8a.push(c0, c1, c2, c3);

    } else {
      throw new Error('Invalid Unicode char.');
    }
  }

  return String.fromCharCode(...Uint8Array.from(u8a));
}

/**
 * convert utf8 to unicode
 */

function utf8_to_unicode (utf8String) {
  const bin = [];

  for (let c of utf8String) {
    bin.push(c.charCodeAt(0));
  }

  const u8 = [];

  for (let i = 0; i < bin.length; i++) {

    if (bin[i] >>> 7 === 0b0) {
      u8.push(bin[i]);
    } else if (bin[i] >>> 5 === 0b110) {
      u8.push((bin[i] << 27 >>> 21) | (bin[++i] << 26 >>> 26));
    } else if (bin[i] >>> 4 === 0b1110) {
      u8.push(
        (bin[i] << 28 >>> 16) | (bin[++i] << 26 >>> 20) | (bin[++i] << 26 >>> 26)
      );
    } else if (bin[i] >>> 3 === 0b11110) {
      u8.push(
        (bin[i] << 29 >>> 11) | (bin[++i] << 26 >>> 14) | 
        (bin[++i] << 26 >>> 20) | (bin[++i] << 26 >>> 26)
      );
    } else {
      throw new Error('Invalid utf8 encode.');
    }
  }

  return String.fromCharCode(...u8);
}

function fromString(string, encoding) {
  let ops;
  if (typeof encoding !== 'string' || encoding.length === 0) {
    if (string.length === 0)
      return new FastBuffer();
    ops = encodingOps.utf8;
    encoding = undefined;
  } else {
    ops = getEncodingOps(encoding);
    if (ops === undefined)
      throw new ERR_UNKNOWN_ENCODING(encoding);
    if (string.length === 0)
      return new FastBuffer();
  }
  return fromStringFast(string, ops);
}

function fromArrayBuffer(obj, byteOffset, length) {
  // Convert byteOffset to integer
  if (byteOffset === undefined) {
    byteOffset = 0;
  } else {
    byteOffset = +byteOffset;
    if (NumberIsNaN(byteOffset))
      byteOffset = 0;
  }

  const maxLength = obj.byteLength - byteOffset;

  if (maxLength < 0)
    throw new ERR_BUFFER_OUT_OF_BOUNDS('offset');

  if (length === undefined) {
    length = maxLength;
  } else {
    // Convert length to non-negative integer.
    length = +length;
    if (length > 0) {
      if (length > maxLength)
        throw new ERR_BUFFER_OUT_OF_BOUNDS('length');
    } else {
      length = 0;
    }
  }

  return new FastBuffer(obj, byteOffset, length);
}

function fromArrayLike(obj) {
  if (obj.length <= 0)
    return new FastBuffer();
  if (obj.length < (Buffer.poolSize >>> 1)) {
    if (obj.length > (poolSize - poolOffset))
      createPool();
    const b = new FastBuffer(allocPool, poolOffset, obj.length);
    b.set(obj, 0);
    poolOffset += obj.length;
    alignPool();
    return b;
  }
  return new FastBuffer(obj);
}

function fromObject(obj) {
  if (obj.length !== undefined || isAnyArrayBuffer(obj.buffer)) {
    if (typeof obj.length !== 'number') {
      return new FastBuffer();
    }
    return fromArrayLike(obj);
  }

  if (obj.type === 'Buffer' && ArrayIsArray(obj.data)) {
    return fromArrayLike(obj.data);
  }
}

export const buf = new Buffer();
