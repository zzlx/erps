/**
 * *****************************************************************************
 *
 * MD5 Algorithm 
 * =============
 *
 * [The MD5 Message-Digest Algorithm](https://www.rfc-editor.org/rfc/rfc1321)
 *
 * MD5(Message-Digest Algorithm 5 信息摘要算法版本5),
 * 一种密码散列函数,产生出一个16字节(128位)的校验值,用于确保信息传输完整一致.
 *
 * 稳定、运算速度快;
 * 压缩性：输入任意长度的数据，输出长度固定（128 比特位);
 * 运算不可逆：已知运算结果的情况下，无法通过通过逆运算得到原始字符串;
 * 高度离散：输入的微小变化，可导致运算结果差异巨大;
 *
 * *****************************************************************************
 */

import { utf8 } from '../utf8.mjs';
import { byteToHex } from '../byteToHex.mjs';
import { Buffer } from '../Buffer.mjs';

// Define 
const S11 = 7,
      S12 = 12,
      S13 = 17,
      S14 = 22,

      S21 = 5,
      S22 = 9,
      S23 = 14,
      S24 = 20,

      S31 = 4,
      S32 = 11,
      S33 = 16,
      S34 = 23,

      S41 = 6,
      S42 = 10,
      S43 = 15,
      S44 = 21;

// define 64 contants
const T = [ 
  0xD76AA478, 0xE8C7B756, 0x242070DB, 0xC1BDCEEE,
  0xF57C0FAF, 0x4787C62A, 0xA8304613, 0xFD469501,
  0x698098D8, 0x8B44F7AF, 0xFFFF5BB1, 0x895CD7BE,
  0x6B901122, 0xFD987193, 0xA679438E, 0x49B40821,
  0xF61E2562, 0xC040B340, 0x265E5A51, 0xE9B6C7AA,
  0xD62F105D, 0x02441453, 0xD8A1E681, 0xE7D3FBC8,
  0x21E1CDE6, 0xC33707D6, 0xF4D50D87, 0x455A14ED,
  0xA9E3E905, 0xFCEFA3F8, 0x676F02D9, 0x8D2A4C8A,
  0xFFFA3942, 0x8771F681, 0x6D9D6122, 0xFDE5380C,
  0xA4BEEA44, 0x4BDECFA9, 0xF6BB4B60, 0xBEBFBC70,
  0x289B7EC6, 0xEAA127FA, 0xD4EF3085, 0x04881D05,
  0xD9D4D039, 0xE6DB99E5, 0x1FA27CF8, 0xC4AC5665,
  0xF4292244, 0x432AFF97, 0xAB9423A7, 0xFC93A039,
  0x655B59C3, 0x8F0CCC92, 0xFFEFF47D, 0x85845DD1,
  0x6FA87E4F, 0xFE2CE6E0, 0xA3014314, 0x4E0811A1,
  0xF7537E82, 0xBD3AF235, 0x2AD7D2BB, 0xEB86D391,
];

// define four auxiliary functions
export const ROTL = (x, n) => (x << n) | (x >>> (32 - n));
const F = (x, y, z) => (x & y) | ((~x) & z);
const G = (x, y, z) => (x & z) | (y & (~z));
const H = (x, y, z) => x ^ y ^ z;
const I = (x, y, z) => y ^ (x | (~z));
const FF = (a, b, c, d, x, s, ac) => addu(ROTL(addu(F(b, c, d), x, ac, a), s), b);
const GG = (a, b, c, d, x, s, ac) => addu(ROTL(addu(G(b, c, d), x, ac, a), s), b);
const HH = (a, b, c, d, x, s, ac) => addu(ROTL(addu(H(b, c, d), x, ac, a), s), b);
const II = (a, b, c, d, x, s, ac) => addu(ROTL(addu(I(b, c, d), x, ac, a), s), b);
const DATA = Symbol('DATA');

export class MD5 extends Buffer {
  constructor () {
    super(16);
    this.blockSize = 64;
  }

  update (data = '', encoding) {
    this[DATA] = typeof data === 'string' ? utf8.encode(data) : data;
    return this;
  }

  toString(format = 'hex') {
    return super.toString(format);
  }
}

/**
 *
 *
 */

MD5.prototype.digest = function (encoding) {
  const m = appendPaddingBits(this[DATA]); // Process Message in 16-Word Blocks
  const x = new Uint32Array(m.buffer);

  const H = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, ];

  for (let k = 0; k < x.length; k += 16) {
    let a = H[0],
        b = H[1],
        c = H[2],
        d = H[3],
        i = 0;

    a = FF(a, b, c, d, x[k + 0], S11, T[i++]);
    d = FF(d, a, b, c, x[k + 1], S12, T[i++]);
    c = FF(c, d, a, b, x[k + 2], S13, T[i++]);
    b = FF(b, c, d, a, x[k + 3], S14, T[i++]);

    a = FF(a, b, c, d, x[k + 4], S11, T[i++]);
    d = FF(d, a, b, c, x[k + 5], S12, T[i++]);
    c = FF(c, d, a, b, x[k + 6], S13, T[i++]);
    b = FF(b, c, d, a, x[k + 7], S14, T[i++]);

    a = FF(a, b, c, d, x[k + 8],  S11, T[i++]);
    d = FF(d, a, b, c, x[k + 9],  S12, T[i++]);
    c = FF(c, d, a, b, x[k + 10], S13, T[i++]);
    b = FF(b, c, d, a, x[k + 11], S14, T[i++]);

    a = FF(a, b, c, d, x[k + 12], S11, T[i++]);
    d = FF(d, a, b, c, x[k + 13], S12, T[i++]);
    c = FF(c, d, a, b, x[k + 14], S13, T[i++]);
    b = FF(b, c, d, a, x[k + 15], S14, T[i++]);

    a = GG(a, b, c, d, x[k + 1],  S21, T[i++]);
    d = GG(d, a, b, c, x[k + 6],  S22, T[i++]);
    c = GG(c, d, a, b, x[k + 11], S23, T[i++]);
    b = GG(b, c, d, a, x[k + 0],  S24, T[i++]);

    a = GG(a, b, c, d, x[k + 5],  S21, T[i++]);
    d = GG(d, a, b, c, x[k + 10], S22, T[i++]);
    c = GG(c, d, a, b, x[k + 15], S23, T[i++]);
    b = GG(b, c, d, a, x[k + 4],  S24, T[i++]);

    a = GG(a, b, c, d, x[k + 9],  S21, T[i++]);
    d = GG(d, a, b, c, x[k + 14], S22, T[i++]);
    c = GG(c, d, a, b, x[k + 3],  S23, T[i++]);
    b = GG(b, c, d, a, x[k + 8],  S24, T[i++]);

    a = GG(a, b, c, d, x[k + 13], S21, T[i++]);
    d = GG(d, a, b, c, x[k + 2],  S22, T[i++]);
    c = GG(c, d, a, b, x[k + 7],  S23, T[i++]);
    b = GG(b, c, d, a, x[k + 12], S24, T[i++]);

    a = HH(a, b, c, d, x[k + 5],  S31, T[i++]);
    d = HH(d, a, b, c, x[k + 8],  S32, T[i++]);
    c = HH(c, d, a, b, x[k + 11], S33, T[i++]);
    b = HH(b, c, d, a, x[k + 14], S34, T[i++]);

    a = HH(a, b, c, d, x[k + 1],  S31, T[i++]);
    d = HH(d, a, b, c, x[k + 4],  S32, T[i++]);
    c = HH(c, d, a, b, x[k + 7],  S33, T[i++]);
    b = HH(b, c, d, a, x[k + 10], S34, T[i++]);

    a = HH(a, b, c, d, x[k + 13], S31, T[i++]);
    d = HH(d, a, b, c, x[k + 0],  S32, T[i++]);
    c = HH(c, d, a, b, x[k + 3],  S33, T[i++]);
    b = HH(b, c, d, a, x[k + 6],  S34, T[i++]);

    a = HH(a, b, c, d, x[k + 9],  S31, T[i++]);
    d = HH(d, a, b, c, x[k + 12], S32, T[i++]);
    c = HH(c, d, a, b, x[k + 15], S33, T[i++]);
    b = HH(b, c, d, a, x[k + 2],  S34, T[i++]);

    a = II(a, b, c, d, x[k + 0],  S41, T[i++]);
    d = II(d, a, b, c, x[k + 7],  S42, T[i++]);
    c = II(c, d, a, b, x[k + 14], S43, T[i++]);
    b = II(b, c, d, a, x[k + 5],  S44, T[i++]);

    a = II(a, b, c, d, x[k + 12], S41, T[i++]);
    d = II(d, a, b, c, x[k + 3],  S42, T[i++]);
    c = II(c, d, a, b, x[k + 10], S43, T[i++]);
    b = II(b, c, d, a, x[k + 1],  S44, T[i++]);

    a = II(a, b, c, d, x[k + 8],  S41, T[i++]);
    d = II(d, a, b, c, x[k + 15], S42, T[i++]);
    c = II(c, d, a, b, x[k + 6],  S43, T[i++]);
    b = II(b, c, d, a, x[k + 13], S44, T[i++]);

    a = II(a, b, c, d, x[k + 4],  S41, T[i++]);
    d = II(d, a, b, c, x[k + 11], S42, T[i++]);
    c = II(c, d, a, b, x[k + 2],  S43, T[i++]);
    b = II(b, c, d, a, x[k + 9],  S44, T[i++]);
     
    H[0] = addu(a, H[0]); 
    H[1] = addu(b, H[1]);
    H[2] = addu(c, H[2]);
    H[3] = addu(d, H[3]);
  }

  const v = new DataView(this.buffer);
  // 以平台字节(小端序)序存储
  v.setUint32(0,  H[0], true);
  v.setUint32(4,  H[1], true);
  v.setUint32(8,  H[2], true);
  v.setUint32(12, H[3], true);

  return this;
}

/**
 *
 *
export function md5 () {
  const msg = Array.prototype.join.call(arguments, '');
  return new MD5().update(msg).digest()
}
 *
 */
export const md5 = msg => new MD5().update(msg).digest();

/**
 * 数据填充算法
 */

export const appendPaddingBits = buf => {
  const l = buf.byteLength;
  let k = 0; // padding bytes
  while ((l + 1 + k)%64 !== 56) { k++; } // caculate k value

  // message padding
  const m = new Buffer(l+1+k+8);  // 
  for (let i = 0; i < buf.byteLength; i++) m[i] = buf[i]; //
  m[l] = 0x80; // append 1 byte

  // bits = x(2^32) + y
  const bits = l * 8;
  const y = bits & 0x00000000FFFFFFFF; 
  const x = (bits - y)/(0xFFFFFFFF+1) & 0xFFFFFFFF;

  // 按小端序存入64位整数
  m[m.byteLength-8] = y;
  m[m.byteLength-7] = y >> 8; 
  m[m.byteLength-6] = y >> 16; 
  m[m.byteLength-5] = y >> 24; 

  m[m.byteLength-4] = x;
  m[m.byteLength-3] = x >> 8; 
  m[m.byteLength-2] = x >> 16; 
  m[m.byteLength-1] = x >> 24; 

  return m; 
}

export function addu () {
  let retval;
  for (const v of arguments) { retval = add(retval, v); }
  return retval;
}

/**
 * Add Unsigned 32-bit integers
 */

export function add (X, Y) {
  const X8 = (X & 0x80000000),
        Y8 = (Y & 0x80000000),
        X4 = (X & 0x40000000),
        Y4 = (Y & 0x40000000),
        result = (X & 0x3FFFFFFF) + (Y & 0x3FFFFFFF);

  if (X4 & Y4) {
    return (result ^ 0x80000000 ^ X8 ^ Y8);
  }

  if (X4 | Y4) {
    if (result & 0x40000000) {
      return (result ^ 0xC0000000 ^ X8 ^ Y8);
    } else {
      return (result ^ 0x40000000 ^ X8 ^ Y8);
    }
  } 

  return (result ^ X8 ^ Y8);
}
