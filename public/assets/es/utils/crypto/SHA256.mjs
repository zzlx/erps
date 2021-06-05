/**
 * *****************************************************************************
 *
 * SHA256 Algorithm 
 * ================
 *
 * 对消息进行补位处理，是的最终的长度是512位的倍数，
 * 然后以512位为单位对消息进行分块
 *
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';
import { encode } from '../utf8/encode.mjs';
import { Buffer } from '../Buffer.mjs';
import { rotateRight } from './rotateRight.mjs';

/*
 * Constants
 */

const DATA = Symbol('DATA');

// 自然数前64个素数的立方根的前32位小数部分
const K = Uint32Array.from([
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
]);

// 逻辑函数
const Ch  = (x, y, z) => (x & y) ^ ((~x) & z);
const Maj = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);
const S = rotateRight;
const R = (X, n) => X >>> n;

function Sigma0(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
function Sigma1(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }


export class SHA256 extends Buffer {
  constructor() {
    super(32);
  }

  update (data, encoding) {
    this[DATA] = encode(data);
    return this;
  }

  static hmac(data, key) {
  }

  toString (format = 'hex') {
    return super.toString(format);
  }
}

/**
 * Add integers, wrapping at 2^32. 
 * This uses 16-bit operations internally to work around bugs in some JS interpreters.
 *
 */

function safe_add (x, y) {
  const lsw = (x & 0xFFFF) + (y & 0xFFFF);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

SHA256.prototype.digest = function () {

  // Step1: 消息预处理
  const l = this[DATA].byteLength * 8;
  // calc k value
  let k = 0;
  while ((l + 1 + k)%512 !== 448) { k++; }

  const m = new Uint8Array((l+k+1)/8 + 8);
  const dv = new DataView(m.buffer);

  for (let i = 0; i < this[DATA].byteLength; i++) {
    const byte = this[DATA][i];
    dv.setUint8(i, byte);
  }

  dv.setUint8(this[DATA].byteLength, 0x80); // setting padding bit
  dv.setUint32(m.byteLength - 4, l >>> 0);  // setting length bits
  //dv.setUint32(m.byteLength - 8, l);      // setting length bits

  // 初始哈希值[公式]取自自然数中前面8个素数(2,3,5,7,11,13,17,19)的平方根的前32位小数部分
  const HASH = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);

  var W = new Array(64);
  let a, b, c, d, e, f, g, h;
  let i, j, T1, T2;

  for (let i = 0; i < m.byteLength; i+=16 ) {
    a = HASH[0];
    b = HASH[1];
    c = HASH[2];
    d = HASH[3];
    e = HASH[4];
    f = HASH[5];
    g = HASH[6];
    h = HASH[7];

    for ( let j = 0; j < 64; j++) {
      if (j < 16) {
        W[j] = m[j + i];
      } else {
        W[j] = safe_add(
          safe_add(
            safe_add(
              Gamma1256(W[j - 2]), 
              W[j - 7]
            ), 
            Gamma0256(W[j - 15])
          ), 
          W[j - 16]
        );
      }

      T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1(e)), Ch(e, f, g)), K[j]), W[j]);
      T2 = safe_add(Sigma0(a), Maj(a, b, c));
      h = g;
      g = f;
      f = e;
      e = safe_add(d, T1);
      d = c;
      c = b;
      b = a;
      a = safe_add(T1, T2);
    }

    HASH[0] = safe_add(a, HASH[0]);
    HASH[1] = safe_add(b, HASH[1]);
    HASH[2] = safe_add(c, HASH[2]);
    HASH[3] = safe_add(d, HASH[3]);
    HASH[4] = safe_add(e, HASH[4]);
    HASH[5] = safe_add(f, HASH[5]);
    HASH[6] = safe_add(g, HASH[6]);
    HASH[7] = safe_add(h, HASH[7]);
  }

  const view = new DataView(this.buffer);

  view.setUint32(0,  HASH[0]);
  view.setUint32(4,  HASH[1]);
  view.setUint32(8,  HASH[2]);
  view.setUint32(12, HASH[3]);
  view.setUint32(16, HASH[4]);
  view.setUint32(20, HASH[5]);
  view.setUint32(24, HASH[6]);
  view.setUint32(28, HASH[7]);

  return this;
}
