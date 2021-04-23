/**
 * *****************************************************************************
 *
 * UTF8 (UCS Transformation Format 8)
 * =================================
 *
 * Each character is represented by one to four bytes.
 * UTF-8 is backward-compatible with ASCII,
 * and can represent any standard Unicode character.
 *
 * The first 128 UTF-8 characters precisely match the first 128 ASCII characters
 * (numbered 0-127), meaning that existing ASCII text is already valid UTF-8.
 * All other characters use two to four bytes.
 *
 * Each byte has some bits reserved for encoding purposes.
 * Since non-ASCII characters require more than one byte for storage, 
 * they run the risk of being corrupted 
 * if the bytes are separated and not recombined.
 *
 * ## 字符编码对应表
 *
 * | Unicode        | UTF-8                               | Byte | 备注      |
 * | -------        | -----                               | ---- | ----      |
 * | 0000~007F      | 0XXXXXXX                            | 1    |           |
 * | 0080~07FF      | 110XXXXX 10XXXXXX                   | 2    |           |
 * | 0800~FFFF      | 1110XXXX 10XXXXXX 10XXXXXX          | 3    | 0~FFFF    |
 * | 1 0000~10 FFFF | 11110XXX 10XXXXXX 10XXXXXX 10XXXXXX | 4    | 0~10 FFFF |
 *
 * *****************************************************************************
 */

/**
 *
 *
 */

export const utf8 = new Proxy({}, {
	get: function (target, property, receiver) {
    if ('encode' === property) {
      return unicode_to_utf8;
    }

    if ('decode' === property) {
      return utf8_to_unicode;
    }

		return Reflect.get(target, property, receiver);
  }
});

/**
 * convert unicode to utf8code
 *
 * @param {array} bin
 * @return {array}
 */

export function unicode_to_utf8 (bin) {
  const u8a = [];

  for (let b32 of bin) {

    if (typeof(b32) === 'string') b32 = b32.charCodeAt(0);
    if (typeof(b32) !== 'number') throw new Error('Invalid code');

    if (b32 < 0x80) {
      u8a.push(b32);
    } else if ((b32 > 0x7F) && (b32 < 0x800)) {

      let c0 = b32 >> 6             | 0b11000000;
      let c1 = b32       & 0b111111 | 0b10000000;

      u8a.push(c0, c1);
    } else if ((b32 > 0x7FF) && (b32 < 0x10000)) {

      let c0 = b32 >> 12            | 0b11100000;
      let c1 = b32 >> 6  & 0b111111 | 0b10000000;
      let c2 = b32       & 0b111111 | 0b10000000;

      u8a.push(c0, c1, c2);
    } else if ((b32 > 0xFFFF) && (b32 < 0x110000)) {

      let c0 = b32 >> 18            | 0b11110000;
      let c1 = b32 >> 12 & 0b111111 | 0b10000000;
      let c2 = b32 >> 6  & 0b111111 | 0b10000000;
      let c3 = b32       & 0b111111 | 0b10000000;

      u8a.push(c0, c1, c2, c3);

    } else {
      throw new Error('Invalid Unicode char.');
    }
  }

  return String.fromCharCode(...Uint8Array.from(u8a));
}

/**
 * convert utf8 to unicode
 */

export function utf8_to_unicode (utf8String) {
  const bin = [];

  for (let c of utf8String) {
    bin.push(c.charCodeAt(0));
  }

  const u8 = [];

  for (let i = 0; i < bin.length; i++) {

    if (bin[i] >>> 7 === 0b0) {
      u8.push(bin[i]);
    } else if (bin[i] >>> 5 === 0b110) {
      u8.push((bin[i] << 27 >>> 21) | (bin[++i] << 26 >>> 26));
    } else if (bin[i] >>> 4 === 0b1110) {
      u8.push(
        (bin[i] << 28 >>> 16) | (bin[++i] << 26 >>> 20) | (bin[++i] << 26 >>> 26)
      );
    } else if (bin[i] >>> 3 === 0b11110) {
      u8.push(
        (bin[i] << 29 >>> 11) | (bin[++i] << 26 >>> 14) | 
        (bin[++i] << 26 >>> 20) | (bin[++i] << 26 >>> 26)
      );
    } else {
      throw new Error('Invalid utf8 encode.');
    }
  }

  return String.fromCharCode(...u8);
}
