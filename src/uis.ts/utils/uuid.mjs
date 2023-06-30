/**
 * *****************************************************************************
 *
 * [A Universally Unique IDentifier](https://www.rfc-editor.org/info/rfc4122)
 *
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 * 8-4-4-4-12
 *
 * *****************************************************************************
 */

import { byteToHex } from './byteToHex.mjs';
import { md5 } from './crypto/md5.mjs';

export const uuid = (buf, i = 0) => new UUID();

export class UUID {
  constructor () {
    this.buf = md5(String(~~Date.now()));
  }

  toString () {
    let i = 0;

    return [
      byteToHex(this.buf[i++]), 
      byteToHex(this.buf[i++]), 
      byteToHex(this.buf[i++]), 
      byteToHex(this.buf[i++]), 
      '-',
      byteToHex(this.buf[i++]), 
      byteToHex(this.buf[i++]), 
      '-',
      byteToHex(this.buf[i++]), 
      byteToHex(this.buf[i++]), 
      '-',
      byteToHex(this.buf[i++]), 
      byteToHex(this.buf[i++]), 
      '-',
      byteToHex(this.buf[i++]), 
      byteToHex(this.buf[i++]),
      byteToHex(this.buf[i++]), 
      byteToHex(this.buf[i++]),
      byteToHex(this.buf[i++]), 
      byteToHex(this.buf[i++]),
    ].join('');
  }
}
