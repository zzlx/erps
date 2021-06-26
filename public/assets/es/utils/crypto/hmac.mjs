/**
 * *****************************************************************************
 *
 * HMAC(Hash-based Message Authentication Code 哈希运算消息认证码)
 *
 * [参考文档RFC 2104](https://www.rfc-editor.org/rfc/rfc2104)
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';
import { warning } from '../warning.mjs';
import { md5 } from './md5.mjs';
import { encode } from '../utf8/encode.mjs';
import { Buffer } from '../Buffer.mjs';
import { bitMask } from '../bitMask.mjs';

export function hmac(data, key, hash) {
  assert(typeof hash === 'function', 'fn must be a hash function.');

  const B = 64; // byte-length of block size 
  const L = hash().byteLength; // byte-length of hash outputs 
  const K = String(key).length > B 
    ? hash(key)
    : key + new Array(B - String(key).length + 1).join('0');
    
  const ipad = new Buffer(B).fill(0x36)
  const opad = new Buffer(B).fill(0x5C);
  console.log(ipad);
  console.log(opad);


  //H(K ^ opad, H(K ^ ipad, M));
  //this.buffer =  
    //
  return md5(data);
}
