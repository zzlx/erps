/**
 * *****************************************************************************
 *
 * Convert utf8 to unicode
 *
 * [Unicode® 13.0.0](https://www.unicode.org/versions/Unicode13.0.0/)
 *
 * *****************************************************************************
 */

export function decode (data) {
  const u8 = []; // 

  let i = 0;

  while (i < data.length) {

    if (data[i] >>> 7 === 0b0) {
      u8.push(data[i++]);
      continue;
    }

    if (data[i] >>> 5 === 0b110) {
      u8.push((data[i] << 27 >>> 21) | (data[++i] << 26 >>> 26));
      i++;
      continue;
    } 

    if (data[i] >>> 4 === 0b1110) {
      u8.push(
        (data[i] << 28 >>> 16) | (data[++i] << 26 >>> 20) | (data[++i] << 26 >>> 26)
      );
      i++;
      continue;
    } 

    if (data[i] >>> 3 === 0b11110) {
      u8.push(
        (data[i] << 29 >>> 11) | (data[++i] << 26 >>> 14) | 
        (data[++i] << 26 >>> 20) | (data[++i] << 26 >>> 26)
      );
      i++;
      continue;
    } 

    throw new Error(`Invalid utf8 encode: ${data[i]}`);
  }

  return String.fromCharCode(...u8);
}
