/**
 * *****************************************************************************
 *
 * Convert a 4 Bytes(32bits) word to Hex
 *
 * *****************************************************************************
 */

import { byteToHex } from './byteToHex.mjs';

// 4 bytes word
export const wordToHex = word => {
  let hex = "";
  for (let i = 0; i <= 3; i++) hex += byteToHex((word >>> (i << 3)) & 0xff);
  return hex;
} 
