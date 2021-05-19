/**
 * *****************************************************************************
 *
 * HMAC(Hash-based Message Authentication Code 哈希运算消息认证码)
 *
 * [参考文档](https://www.rfc-editor.org/rfc/rfc2104)
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';
import { warning } from '../warning.mjs';
import { MD5 } from './MD5.mjs';
import { encode } from '../utf8/encode.mjs';

console.log(encode('王'));
export class HMAC {
  constructor() {
  }

  /**
   *
   * @param {} M
   * @param {} K
   */

  update (M, K, H) {
    assert(typeof H === 'function', 'H must be a hash function.');
    const B = 64;
    if (String(K).length > B) {
      K = H(K);
    } else if (String(K).length < B) {
      K = K + new Array(B - String(K).length + 1).join('0');
    }
    K = encode(K); 
    const L = H().byteLength;
    const opad = new Uint8Array(B).map(v => 0x5C);
    const ipad = new Uint8Array(B).map(v => 0x36)

    this.hash = H(K ^ opad, H(K ^ ipad, M));

    return this;
  }

  digest () {
    return `${this.hash}`;
  }

  toString() {
    return this.digest();
  }
}
