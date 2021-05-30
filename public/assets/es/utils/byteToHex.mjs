/**
 * *****************************************************************************
 *
 * Convert 1 Byte to Hex string
 *
 * *****************************************************************************
 */

const HEX = [...'0123456789abcdef'];

export function byteToHex (b) {
  // 1:
  return HEX[b >> 4 & 0xF] + HEX[b & 0xF];
  // 2: 
  return String("0" + b.toString(16)).substr(-2);
}
