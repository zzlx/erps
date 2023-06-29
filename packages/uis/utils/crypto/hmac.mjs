/**
 * *****************************************************************************
 *
 * HMAC(Hash-based Message Authentication Code 哈希运算消息认证码)
 *
 *
 * HMAC算法的定义用公式表示如下：
 * HMAC（K，M）= H（（K’⊕opad）∣H（（K’⊕ipad）∣M））
 *
 * [参考文档RFC 2104](https://www.rfc-editor.org/rfc/rfc2104)
 * *****************************************************************************
 */

import { Buffer } from '../Buffer.mjs';
import { utf8 } from '../utf8.mjs';

export function hmac(message, key, hash) {
  if (typeof hash !== 'function') throw new Error('Hash function is invalid!'); 
  if (typeof key === 'string') { key = utf8.encode(key); }

  const H = hash;    // cryptographic hash function
  const M = utf8.encode(message);
  const test = H();
  const B = test.blockSize;  // the byte-length of block size 
  if (key.length > B) { key = H(key); }

  const ipad = new Buffer(B); ipad.set(key);
  const opad = new Buffer(B); opad.set(key);
  for (let i = 0; i < B; i++) { ipad[i] ^= 0x36; opad[i] ^= 0x5C; }

  return H(concat(opad, H(concat(ipad, M))));
}

/**
 *
 *
 */

export function concat () {
  let l = 0;
  for (const o of arguments) { l += o.byteLength; }
  const buffer = new Buffer(l);
  let offset = 0;
  for (const o of arguments) { 
    buffer.set(o, offset);
    offset += o.byteLength;
  }
  return buffer;
}

/**
 *
 *
 */

function wordsToU8 (wordArray) {
  const words = wordArray;
  const bytes = words.length * 4;
  const u8 = new Buffer(bytes);

  for (let i = 0; i < bytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff; // 大端序
  }

  return u8;
}

/**
 * Converts a Uint8Array to a word array.
 */

function u8ToWord (u8array) {
  const length = u8array.length;
  const words = new Uint32Array(length>>2); 

  for (let i = 0; i < length; i++) {
    words[i >>> 2] |= (u8arry[i] & 0xff) << (24 - (i % 4) * 8); // 大端序
  }

  return words;
}
