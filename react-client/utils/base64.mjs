/**
 * ***************************************************************************** *
 *
 * Base64 Algorithm
 * =================
 *
 * 基于64个可打印字符来表示二进制数据的一种方法, 用于传输8Bit字节码的编码算法.
 *
 * # 编码算法:
 *
 * 1. 对数据进行分组,每三个字节作为一组，一共24bits;
 * 2. 对24bits划分为4组,每组6bits;
 * 3. 对每组的6bits前补2位0,构成8bits,有效位数为6位,可表示64个编码量
 * 4. 根据base64编码表,获取4组数据对应的编码值; 
 *
 * *****************************************************************************
 */

import utf8 from './utf8.mjs';

// The Base64 Alphabet
const b64a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const b64table = [...b64a]; // base64 char table
const b64code  = b64table.map(v => v.charCodeAt(0));
const b64map  = (a => {
  const map = {};
  a.map((v,k) => { map[v] = k; });
  return map;
})(b64table);

const Base64 = {
  /** 
   * Creates a Base64-encoded ASCII string from a binary string
   *
   * In JavaScript, strings are represented using the UTF-16 character encoding: 
   * in this encoding, strings are represented as a sequence of 16-bit (2 byte) units. 
   * Every ASCII character fits into the first byte of one of these units, 
   * but many other characters don't.
   *
   * Base64, by design, expects binary data as its input. 
   * In terms of JavaScript strings, 
   * this means strings in which each character occupies only one byte. 
   * So if you pass a string into btoa() containing characters 
   * that occupy more than one byte, 
   * you will get an error, because this is not considered binary data:
   *
   * @params {array} stringToEncode The binary string to encode.
   * @return {string} The Base64 ASCII string representation of stringToEncode.
   * @api private
   */

  btoa: function (stringToEncode) {
    const bin = stringToEncode;
    const pad = bin.length % 3;
    const length = pad === 0 ? bin.length : bin.length + 3 - pad;
    const bytes = new Uint8Array(length / 3 * 4);
    let b = 0;

    for (let i = 0; i < bin.length;) { 
      let c0 = bin.charCodeAt(i++), 
          c1 = bin.charCodeAt(i++),
          c2 = bin.charCodeAt(i++);

      if (c0 > 255 || c1 > 255 || c2 > 255) {
        throw new TypeError('invalid character found');
      }

      // 24 bits
      const b24 = ((c0 << 16) | (c1 << 8) | c2 ) & 0xffffff;

      bytes[b++] = b64code[b24 >>> 18 & 0b111111];
      bytes[b++] = b64code[b24 >>> 12 & 0b111111];
      bytes[b++] = b64code[b24 >>> 6  & 0b111111];
      bytes[b++] = b64code[b24        & 0b111111];
    }

    if (pad >= 1 ) bytes[bytes.length - 1] = 0x3d;
    if (pad === 1) bytes[bytes.length - 2] = 0x3d;

    return String.fromCharCode(...bytes);
  },

  /**
   * convert ascii to binary
   *
   * @params {string} A binary string contains an base64 encoded data.
   * @return {string} An ASCII string containing decoded data from encodedData.
   *
   */

  atob: function (encodedData) {
    let asc = encodedData;

    let extraByte = 0;
    if (asc[asc.length-1] === '=') extraByte = 1;
    if (asc[asc.length-2] === '=') extraByte = 2;

    const bytes = new Uint8Array(asc.length/4*3 - extraByte);
    let b = 0;

    for (let i = 0; i < asc.length;) {

      const b24 = b64map[asc.charAt(i++)] << 18
                | b64map[asc.charAt(i++)] << 12
                | b64map[asc.charAt(i++)] << 6
                | b64map[asc.charAt(i++)];

      bytes[b++] = b24 >>> 16 & 255;
      bytes[b++] = b24 >>> 8 & 255;
      bytes[b++] = b24 & 255;
    }

    return String.fromCharCode(...bytes);
  },

  /**
   * convert a Unicode string to a string in which
   * each 16-bit unit occupies only one byte
   */

  toBinary: function (string) {
    const codeUnits = new Uint16Array(string.length);

    for (let i = 0; i < codeUnits.length; i++) {
      codeUnits[i] = string.charCodeAt(i);
    }

    return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
  },

  /**
   * convert binary string to utf16
   */

  fromBinary: function (binary) {
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return String.fromCharCode(...new Uint16Array(bytes.buffer));
  },

  uriSafe: function (src) {
    return src.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },

  unURI: function (src) {
    return src
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .replace(/[^A-Za-z0-9\+\/]/g, '');
  },
};

export default new Proxy(Base64, { 
	get: function (target, property, receiver) {
    if ('btoa' === property) {
      return typeof Buffer === 'function' 
          ? bin => Buffer.from(bin, 'binary').toString('base64')
          : target.btoa;
    }

    if ('atob' === property) {
      return typeof Buffer === 'function' 
          ? asc => Buffer.from(a, 'base64').toString('utf8')
          : target.atob;
    }

    if ('encode' === property) {
      return typeof Buffer === 'function'
        ? (s, urlsafe = false) => urlsafe
          ? target.uriSafe(Buffer.from(s, 'utf8').toString('base64'))
          : Buffer.from(s, 'utf8').toString('base64')
        : (s,urlsafe = false) => urlsafe
          ? target.uriSafe(target.btoa(utf8.encode(s)))
          : target.btoa(utf8.encode(s));
    }

    if ('decode' === property) {
      return typeof Buffer === 'function'
        ? (a) => Buffer.from(target.unURI(a), 'base64').toString('utf8')
        : (a) => utf8.decode(target.atob(target.unURI(a)));
    }

    if (!(property in target)) {
      const msg = `${property} is not supported.`;
      if (console && console.warn) console.warn(msg);
      else console.log(msg);
    }

		return Reflect.get(target, property, receiver);
  }
});
