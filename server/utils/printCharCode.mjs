/**
 *
 *
 */

export default function printCharCode(code) {
  return (
    // NaN/undefined represents access beyond the end of the file.
    isNaN(code) 
      ? '<EOF>' 
      : code < 0x7f // Trust JSON for ASCII.
        ? JSON.stringify(String.fromCharCode(code)) 
        // Otherwise print the escaped form.
        : "\"\\u".concat(('00' + code.toString(16).toUpperCase()).slice(-4), "\"")
  );
}

console.log(printCharCode(29579)); // test
