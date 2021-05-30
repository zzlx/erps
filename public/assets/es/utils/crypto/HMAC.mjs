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
import { MD5 } from './MD5.mjs';
import { encode } from '../utf8/encode.mjs';
import { Buffer } from '../Buffer.mjs';
import { bitMask } from '../bitMask.mjs';

export class HMAC {
  constructor() {
    this.name = 'HMAC Algorithm';
  }

  /**
   *
   * @param {} M 消息
   * @param {} K
   */

  update (M, K, H) {
    assert(typeof H === 'function', 'H must be a hash function.');

    const B = 64; // block size 
    const L = H().byteLength;

    const opad = new Buffer(B).fill(0x5C);
    const ipad = new Buffer(B).fill(0x36)

    // setp_1: check length of K
    if (String(K).length > B) { K = H(K); }
    if (String(K).length < B) {
      K = K + new Array(B - String(K).length + 1).join('0');
    }

    //H(K ^ opad, H(K ^ ipad, M));
    //this.buffer =  
    //

    return this.buffer;
  }

  digest () {
    return `${this.hash}`;
  }

  toString() {
    return this.digest();
  }
}
