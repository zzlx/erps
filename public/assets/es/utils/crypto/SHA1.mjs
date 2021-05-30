/**
 * *****************************************************************************
 *
 * Secure Hash Algorithm 1
 * ================
 *
 * SHA-1是一种密码散列函数，
 * 可以生成一个被称为消息摘要的160位（20字节）散列值，散列值通常的呈现形式为40个十六进制数。
 *
 * *****************************************************************************
 */

import { byteToHex } from '../byteToHex.mjs';
import { Buffer } from '../Buffer.mjs';
import { rotateLeft as ROTL } from './rotateLeft.mjs';

const H = [
  0x67452301, 
  0xefcdab89, 
  0x98badcfe, 
  0x10325476, 
  0xc3d2e1f0
];

const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];

const DATA = Symbol('DATA');

export class SHA1 extends Buffer {
  constructor () {
    super(20);
  }

  update (data, encode) {
    this[DATA] = data;
    return this;
  }

  toString(format = 'hex') {
    return super.toString(format);
  }
}

SHA1.prototype.digest = function () {
  const content = this[DATA];
  let bytes = null; 

  if (typeof(content) === 'string') {
    const msg = unescape(encodeURIComponent(content)); // UTF8 escape
    bytes = new Array(msg.length);
    for (let i = 0; i < msg.length; i++) bytes[i] = msg.charCodeAt(i);
  }

  // Pre-processing
  bytes.push(0x80);

  const l = bytes.length/4 + 2;
  const N = Math.ceil(l/16);
  const M = new Array(N);

  for (let i=0; i < N; i++) {
    M[i] = new Array(16);

    for (let j=0; j<16; j++) {
      M[i][j] = bytes[i * 64 + j * 4] << 24 |
                bytes[i * 64 + j * 4 + 1] << 16 |
                bytes[i * 64 + j * 4 + 2] << 8 |
                bytes[i * 64 + j * 4 + 3];
    }
  }

  M[N - 1][14] = ((bytes.length - 1) * 8) /
    Math.pow(2, 32); M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = ((bytes.length - 1) * 8) & 0xffffffff;

  for (let i=0; i < N; i++) {
    const W = new Array(80);

    for (let t = 0;  t < 16; t++) W[t] = M[i][t];
    for (let t = 16; t < 80; t++) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }

    // Initialize hash value
    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];

    // main loop
    for (let t = 0; t < 80; t++) {
      const s = Math.floor(t/20);
      const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }

    // Add this chunk's hash to result 
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
  }

  const view = new DataView(this.buffer);
  // Initialize hash value
  view.setUint32(0,  H[0]);
  view.setUint32(4,  H[1]);
  view.setUint32(8,  H[2]);
  view.setUint32(12, H[3]);
  view.setUint32(16, H[4]);

  return this;
}

function f(s, x, y, z) {
  switch (s) {
    case 0: return (x & y) ^ (~x & z);
    case 1: return x ^ y ^ z;
    case 2: return (x & y) ^ (x & z) ^ (y & z);
    case 3: return x ^ y ^ z;
  }
}
