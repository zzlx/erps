/**
 * *****************************************************************************
 *
 * [A Universally Unique IDentifier](https://tools.ietf.org/html/rfc4122)
 *
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 * 8-4-4-4-12
 *
 * *****************************************************************************
 */

export function uuid(buf, offset) {
  const byteToHex = [];

  for (let i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
  }

  let i = offset || 0;

  return [
    byteToHex[buf[i++]], 
    byteToHex[buf[i++]], 
    byteToHex[buf[i++]], 
    byteToHex[buf[i++]], 
    '-',
    byteToHex[buf[i++]], 
    byteToHex[buf[i++]], 
    '-',
    byteToHex[buf[i++]], 
    byteToHex[buf[i++]], 
    '-',
    byteToHex[buf[i++]], 
    byteToHex[buf[i++]], 
    '-',
    byteToHex[buf[i++]], 
    byteToHex[buf[i++]],
    byteToHex[buf[i++]], 
    byteToHex[buf[i++]],
    byteToHex[buf[i++]], 
    byteToHex[buf[i++]]
  ].join('');
}
