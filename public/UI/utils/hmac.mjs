/**
 * *****************************************************************************
 *
 * HMAC
 *
 * Hash-based Message Authentication Code
 * 哈希运算消息认证码
 *
 *
 * @TODO: 未完成
 *
 * *****************************************************************************
 */

import { assert } from './assert.mjs';
import { isBuffer } from './isBuffer.mjs';

export const hmac = function () {}

class HMAC {
  /**
   * Create an HMAC.
   * @param {Function} Hash
   * @param {Number} size
   * @param {Array} [x=[]]
   * @param {Array} [y=[]]
   */

  constructor(Hash, size, x = [], y = []) {
    assert(typeof Hash === 'function');
    assert((size >>> 0) === size);
    assert(Array.isArray(x));
    assert(Array.isArray(y));

    this.hash = Hash;
    this.size = size;
    this.x = x;
    this.y = y;

    this.inner = new Hash();
    this.outer = new Hash();
  }

  /**
   * Initialize HMAC context.
   * @param {Buffer} data
   */

  init(key) {
    assert(isBuffer(key));

    // Shorten key
    if (key.length > this.size) {
      const Hash = this.hash;
      const h = new Hash();

      h.init(...this.x);
      h.update(key);

      key = h.final(...this.y);

      assert(key.length <= this.size);
    }

    // Pad key
    const pad = Buffer.alloc(this.size);

    for (let i = 0; i < key.length; i++)
      pad[i] = key[i] ^ 0x36;

    for (let i = key.length; i < pad.length; i++)
      pad[i] = 0x36;

    this.inner.init(...this.x);
    this.inner.update(pad);

    for (let i = 0; i < key.length; i++)
      pad[i] = key[i] ^ 0x5c;

    for (let i = key.length; i < pad.length; i++)
      pad[i] = 0x5c;

    this.outer.init(...this.x);
    this.outer.update(pad);

    return this;
  }

  /**
   * Update HMAC context.
   * @param {Buffer} data
   */

  update(data) {
    this.inner.update(data);
    return this;
  }

  /**
   * Finalize HMAC context.
   * @returns {Buffer}
   */

  final() {
    this.outer.update(this.inner.final(...this.y));
    return this.outer.final(...this.y);
  }
}
