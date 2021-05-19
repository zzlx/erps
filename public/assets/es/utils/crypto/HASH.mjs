/**
 * *****************************************************************************
 *
 * HASH
 *
 * *****************************************************************************
 */

import { byteToHex } from '../byteToHex.mjs';

export class HASH extends Uint8Array {
  constructor() {
    super();
  }

  digest () {
    return [...this].map(byteToHex).join('');
  }

  toString() {
    return this.digest();
  }
}
