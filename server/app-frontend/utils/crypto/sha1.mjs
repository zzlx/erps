/**
 * *****************************************************************************
 *
 * SHA1
 * ====
 *
 * Secure Hash Algorithm 1,安全散列算法1
 *
 * [RFC 3174](https://www.rfc-editor.org/info/rfc3174)
 *
 * SHA-1是一种密码散列函数，
 * 生成一个被称为消息摘要的160位（20字节）散列值，
 * 散列值通常的呈现形式为40个十六进制数。
 *
 * 可以生成一个被称为消息摘要的160位（20字节）散列值，散列值通常的呈现形式为40个十六进制数。*
 * *****************************************************************************
 */

import { Buffer } from '../Buffer.mjs';
import { utf8 } from '../utf8.mjs';
import { add } from './sha256.mjs';
//import { appendPaddingBits }  from './md5.mjs';

const DATA = Symbol('DATA');
const K = t => {
  const s = Math.floor(t/20);
  switch (s) {
    case 0: return 0x5A827999;
    case 1: return 0x6ED9EBA1;
    case 2: return 0x8F1BBCDC;
    case 3: return 0xCA62C1D6;
  }
}
const ROTL = (x, n) => (x << n) | (x >>> (32 - n));
const f = (t, b, c, d) => {
  const s = Math.floor(t/20);
  switch (s) {
    case 0: return (b & c) | (~b & d);
    case 1: return b ^ c ^ d;
    case 2: return (b & c) | (b & d) | (c & d);
    case 3: return b ^ c ^ d;
  }
}

export class SHA1 extends Buffer {
  constructor () {
    super(20); // 20 bytes 160-bits
    this.blockSize = 64;
  }

  update (data = '', encoding = '') {
    this[DATA] = typeof data === 'string' ?  utf8.encode(data) : data;
    this.isDigest = false;
    return this;
  }

  toString(format = 'hex') {
    return super.toString(format);
  }
}

SHA1.prototype.verify = function (digest = '') {
  const HEX = '0123456789abcdef';
  if (this.isDigest == false) throw new Error('Error');
  const d = this.toString();
  if (d !== digest) return false;
  return true;
}

/**
 *
 * digest
 *
 */

SHA1.prototype.digest = function () {
  const content = this[DATA];
  const m = appendPaddingBits(this[DATA]); 
  const mv = new DataView(m.buffer);

  // Initialize hash value
  const H = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0, ];

  // Process 16-word block 
  for (let i=0; i < m.byteLength; i+=64) {
    const W = new Array(80);
    let a = H[0],
        b = H[1],
        c = H[2],
        d = H[3],
        e = H[4];

    // main loop
    for (let t = 0; t < 80; t++) {
      if (t < 16) W[t] = mv.getUint32(i + t*4);
      else W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);

      const TEMP = ROTL(a, 5) + f(t, b, c, d) + e + W[t] + K(t);
      e = d; 
      d = c; 
      c = ROTL(b, 30); 
      b = a; 
      a = TEMP;
    }

    H[0] = add(H[0], a);
    H[1] = add(H[1], b);
    H[2] = add(H[2], c);
    H[3] = add(H[3], d);
    H[4] = add(H[4], e);
  }

  const v = new DataView(this.buffer);
  v.setUint32(0,  H[0]);
  v.setUint32(4,  H[1]);
  v.setUint32(8,  H[2]);
  v.setUint32(12, H[3]);
  v.setUint32(16, H[4]);

  this.isDigest = true;
  return this;
}

export const appendPaddingBits = buf => {
  const l = buf.byteLength;
  let k = 0; // padding bytes
  while ((l + 1 + k)%64 !== 56) { k++; } // caculate k value

  // message padding
  const m = new Buffer(l+1+k+8);  // 
  for (let i = 0; i < buf.byteLength; i++) m[i] = buf[i]; //
  m[l] = 0x80; // append 1 byte

  // bits = x(2^32) + y
  // bits = (x,y)
  const bits = l * 8;
  const y = bits & 0x00000000FFFFFFFF; 
  const x = (bits - y)/(0xFFFFFFFF+1) & 0xFFFFFFFF;

  // 大端序存入64位整数
  m[m.byteLength-8] = x >> 24;
  m[m.byteLength-7] = x >> 16; 
  m[m.byteLength-6] = x >> 8; 
  m[m.byteLength-5] = x; 
  m[m.byteLength-4] = y >> 24;
  m[m.byteLength-3] = y >> 16; 
  m[m.byteLength-2] = y >> 8; 
  m[m.byteLength-1] = y; 

  return m; 
}

/**
 *
 *
export function sha1 () {
  const msg = Array.prototype.join.call(arguments, '');
  return new SHA1().update(msg).digest()
}
 *
 */
export const sha1 = msg => new SHA1().update(msg).digest();   
