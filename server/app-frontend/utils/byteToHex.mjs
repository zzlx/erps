/**
 * *****************************************************************************
 *
 * Convert 1 Byte to Hex string
 *
 * *****************************************************************************
 */

export const HEX = [...'0123456789abcdef'];
export const HEX_MAP = (() => {
  const MAP = {}
  HEX.map((v,i) => MAP[v] = i);
  return MAP
})();

export const byteToHex = b => HEX[b >> 4 & 0xF] + HEX[b & 0xF];
//return String("0" + b.toString(16)).substr(-2);
