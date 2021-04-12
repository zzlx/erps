/**
 * *****************************************************************************
 * 
 * 打印字符编码
 *
 * *****************************************************************************
 */

export default function printCharCode(code) {
  return (
    isNaN(code) 
      // NaN/undefined represents access beyond the end of the file.
      ? '<EOF>' 
      // Trust JSON for ASCII.
      // Otherwise print the escaped form.
      : code < 0x7f 
        ? JSON.stringify(String.fromCharCode(code)) 
        : "\"\\u".concat(('00' + code.toString(16).toUpperCase()).slice(-4), "\"")
  );
}
