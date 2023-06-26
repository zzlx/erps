/**
 * *****************************************************************************
 *
 * base64 modules
 *
 *  基于64个可打印字符来表示二进制数据的一种方法, 用于传输8Bit字节码的编码算法.
 *
 *  # 编码算法:
 *
 * * 对数据进行分组,每三个字节作为一组，一共24bits;
 * * 对24bits划分为4组,每组6bits;
 * * 对每组的6bits前补2位0,构成8bits,有效位数为6位,可表示64个编码量
 * * 根据base64编码表,获取4组数据对应的编码值; 
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';
import { Buffer } from '../Buffer.mjs';
import { isPlainObject } from '../is/isPlainObject.mjs';

// The Base64 Alphabet
const b64a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const b64code  = [...b64a].map(v => v.charCodeAt(0));
const b64map  = (() => {
  const map = {};
  [...b64a].map((v, i) => { map[v] = i; });
  return map;
})();

export const base64 = new Proxy({
}, {
  get: function(target, property, receiver) {
    if (property === 'encode') return encode;
  }
});


/**
 * btoa algorithm
 *
 * Convert Binary to Assii 
 *
 * @param {string|buffer} data support buffer or string data
 * @return {buffer}
 */

export function btoa (data, url = false) {

  const isBuffer = data instanceof Uint8Array; // if data is a buffer
  const pad = data.length % 3; // pad
  const length = pad === 0 ? data.length : data.length + 3 - pad;
  const l = url ? (3-pad)%3 : 0; // 支持url
  const buffer = new Buffer(length / 3 * 4 - l);

  const a = [];
  let   b = 0; // 

  // transform 3-byte data to 24-bits data;
  const update = () => {
    const b24 = ((a.shift() << 16) | (a.shift() << 8) | a.shift() << 0) & 0xFFFFFF;

    buffer[b++] = b64code[b24 >>> 18 & 0x3F];
    buffer[b++] = b64code[b24 >>> 12 & 0x3F];
    buffer[b++] = b64code[b24 >>> 6  & 0x3F];
    buffer[b++] = b64code[b24        & 0x3F];
  }

  // iterate all byte of data
  for (const v of data) {
    const code = isBuffer ? v : v.charCodeAt(0);
    assert(code < 255, `Invalid charactor ${v}.`);
    a.push(code); // push code
    if (a.length === 3) update();
  }

  if (a.length > 0) update(); // ? forget why 
  
  if (url === false) {
    if (pad >= 1 ) buffer[buffer.length - 1] = 0x3D;
    if (pad === 1) buffer[buffer.length - 2] = 0x3D;
  } else {
    for (let i = 0; i < buffer.byteLength; i++ ) {
      if (buffer[i] === 43) { buffer[i] = 45; continue; }
      if (buffer[i] === 47) { buffer[i] = 95; continue; }
    }
  }

  return buffer;
}

/**
 * Convert ascii to binary
 *
 * [RFC 2045~2049](https://www.rfc-editor.org/rfc/rfc2045)
 *
 * @param {string|buffer} bin
 * @return {buffer}
 */

export function atob (data, url = false) {
  assert(data.length % 4 === 0, `The data param is invalid.`);
  const isBuffer = data instanceof Uint8Array; // test param is a buffer
  let extraByte = 0;
  if (data[data.length - 1] === '=') extraByte = 1;
  if (data[data.length - 2] === '=') extraByte = 2;
  //if (data.length%4 != 0)  
  const bufferLength = data.length/4*3 - extraByte;
  const buffer = new Buffer(bufferLength);

  const a = [];
  let   b = 0; 

  const update = () => {
    const b24 = b64map[a.shift()] << 18
              | b64map[a.shift()] << 12
              | b64map[a.shift()] << 6
              | b64map[a.shift()] << 0;

    buffer[b++] = b24 >>> 16 & 0xFF;
    buffer[b++] = b24 >>> 8  & 0xFF;
    buffer[b++] = b24        & 0xFF;
  }

  for (const v of data) {
    const c = isBuffer ? String.fromCharCode(v) : v;
    assert(b64map[c] || c === '=', `Invalid c ${c}`)
    a.push(c);
    if (a.length === 4) update();
  }

  if (a.length) update();

  return buffer;
}

/**
 * convert binary string to utf16
 */

export function fromBinary (binary) {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) { bytes[i] = binary.charCodeAt(i); }
  return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

/**
 * convert a Unicode string to a string in which
 * each 16-bit unit occupies only one byte
 */

export function toBinary (string) {
  const codeUnits = new Uint16Array(string.length);
  for (let i = 0; i < codeUnits.length; i++) { codeUnits[i] = string.charCodeAt(i); }
  return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
}


export function encode (str, url_safe = false) {
  const base64 = typeof str === 'object' && isPlainObject(str)
    ? btoa(JSON.stringify(str), url_safe) 
    : btoa(str, url_safe);
  return base64;
}

/**
 * Convert ascii to binary
 */

export function decode (base64) {
    base64 = base64
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .replace(/[^A-Za-z0-9\+\/]/g, '');

  return atob(base64);
}
