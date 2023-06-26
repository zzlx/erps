/**
 * *****************************************************************************
 *
 * SHA256 Algorithm 
 * ================
 *
 * 对消息进行补位处理，是的最终的长度是512位的倍数，
 * 然后以512位为单位对消息进行分块
 *
 * [RFC 4634](https://datatracker.ietf.org/doc/html/rfc4634)
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';
import { utf8 } from '../utf8.mjs';
import { Buffer } from '../Buffer.mjs';
import { appendPaddingBits } from './sha1.mjs';


// 自然数前64个素数的立方根的前32位小数部分
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

// 逻辑函数
export const ROTR = (x, n) => ((x >>> n) | (x << (32 - n)));
const Ch  = (x, y, z) => (x & y) ^ (~x & z);
const Maj = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);
const Sigma0 = x => ROTR(x,  2) ^ ROTR(x, 13) ^ ROTR(x, 22);
const Sigma1 = x => ROTR(x,  6) ^ ROTR(x, 11) ^ ROTR(x, 25);
const sigma0 = x => ROTR(x,  7) ^ ROTR(x, 18) ^ (x >>> 3);
const sigma1 = x => ROTR(x, 17) ^ ROTR(x, 19) ^ (x >>> 10);
const DATA = Symbol('DATA');

export class SHA256 extends Buffer {
  constructor() {
    super(32);
    this.blockSize = 64;
  }

  update (data = '', inputEncoding = 'utf8') {
    // 处理字符串时进行utf8编码
    this[DATA] = typeof data === 'string' ? utf8.encode(data) : data;
    return this;
  }

  static hmac(data, key) {
  }

  toString (format = 'hex') {
    return super.toString(format);
  }
}

SHA256.prototype.digest = function (encoding = 'hex') {
  // 遍历消息块, 512位为一组，64字节
  // m 为uint32数组, 16个为512位
  const m = appendPaddingBits(this[DATA]);
  const mv = new DataView(m.buffer);

  // 初始哈希值
  // 取自自然数中前面8个素数(2,3,5,7,11,13,17,19)的平方根的前32位小数部分
  const H = [ 
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  for (let i = 0; i < m.byteLength; i+=64) {
    const W = new Uint32Array(64); // 扩展消息块

    let a = H[0],
        b = H[1],
        c = H[2],
        d = H[3],
        e = H[4],
        f = H[5],
        g = H[6],
        h = H[7];

    // 遍历消息块,对消息块应用压缩函数
    for ( let j = 0; j < 64; j++) {
      if (j < 16) {
        W[j] = mv.getUint32(i + j*4);
      } else {
        W[j] = add(sigma1(W[j - 2]), W[j - 7], sigma0(W[j - 15]), W[j - 16]);
      }

      // Temp
      const T1 = add(h, Sigma1(e), Ch(e, f, g), K[j], W[j]);
      const T2 = add(Sigma0(a), Maj(a, b, c));

      h = g;
      g = f;
      f = e;
      e = add(d, T1);
      d = c;
      c = b;
      b = a;
      a = add(T1, T2);
    }

    H[0] = add(H[0], a);
    H[1] = add(H[1], b);
    H[2] = add(H[2], c);
    H[3] = add(H[3], d);
    H[4] = add(H[4], e);
    H[5] = add(H[5], f);
    H[6] = add(H[6], g);
    H[7] = add(H[7], h);
  }

  const hv = new DataView(this.buffer);
  hv.setUint32(0,  H[0]);
  hv.setUint32(4,  H[1]);
  hv.setUint32(8,  H[2]);
  hv.setUint32(12, H[3]);
  hv.setUint32(16, H[4]);
  hv.setUint32(20, H[5]);
  hv.setUint32(24, H[6]);
  hv.setUint32(28, H[7]);

  return this;
}

/**
 *
export function sha256 () {
  const msg = Array.prototype.join.call(arguments, '');
  return new SHA256().update(msg).digest()
}
 *
 */
export const sha256 = msg => new SHA256().update(msg).digest();

/**
 *
 * Add 32-bit integers
 *
 * do not check if overflow
 * 
 */

export const safe_add = (x, y) => {
  const lsw = (x & 0xFFFF) + (y & 0xFFFF);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

export function add () {
  let retval;
  for (const v of arguments) { retval = safe_add(retval, v); }
  return retval;
}
