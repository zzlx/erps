/**
 * *****************************************************************************
 *
 * 判断是否为windows根设备
 *
 * C:\
 *
 * *****************************************************************************
 */

const CHAR_UPPERCASE_A = 65;    // A
const CHAR_UPPERCASE_Z = 90;    // Z
const CHAR_LOWERCASE_A = 97;    // a
const CHAR_LOWERCASE_Z = 122;   // z

export function isWindowsDeviceRoot(code) {
  return (code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z) || 
         (code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z); 
}

