/**
 * *****************************************************************************
 *
 * MD5 Algorithm 
 * =============
 *
 * [The MD5 Message-Digest Algorithm](https://www.rfc-editor.org/rfc/rfc1321)
 *
 * MD5(Message-Digest Algorithm 5 信息摘要算法版本5),
 * 一种密码散列函数,产生出一个16字节(128位)的校验值,用于确保信息传输完整一致.
 *
 * 稳定、运算速度快;
 * 压缩性：输入任意长度的数据，输出长度固定（128 比特位);
 * 运算不可逆：已知运算结果的情况下，无法通过通过逆运算得到原始字符串;
 * 高度离散：输入的微小变化，可导致运算结果差异巨大;
 *
 * *****************************************************************************
 */

import { encode } from '../utf8/index.mjs';
import { byteToHex } from '../byteToHex.mjs';
import { rotateLeft } from './rotateLeft.mjs';

const R = [
  0x01234567,
  0x89abcdef,
  0xfedcba98,
  0x76543210,
];

const S = [
  7, 12, 17, 22,
  5, 9,  14, 20,
  4, 11, 16, 23,
  6, 10, 15, 21,
];

const T = new Uint32Array([ 
  0xD76AA478,0xE8C7B756,0x242070DB,0xC1BDCEEE,0xF57C0FAF,0x4787C62A,0xA8304613,0xFD469501,
  0x698098D8,0x8B44F7AF,0xFFFF5BB1,0x895CD7BE,0x6B901122,0xFD987193,0xA679438E,0x49B40821,
  0xF61E2562,0xC040B340,0x265E5A51,0xE9B6C7AA,0xD62F105D,0x02441453,0xD8A1E681,0xE7D3FBC8,
  0x21E1CDE6,0xC33707D6,0xF4D50D87,0x455A14ED,0xA9E3E905,0xFCEFA3F8,0x676F02D9,0x8D2A4C8A,
  0xFFFA3942,0x8771F681,0x6D9D6122,0xFDE5380C,0xA4BEEA44,0x4BDECFA9,0xF6BB4B60,0xBEBFBC70,
  0x289B7EC6,0xEAA127FA,0xD4EF3085,0x04881D05,0xD9D4D039,0xE6DB99E5,0x1FA27CF8,0xC4AC5665,
  0xF4292244,0x432AFF97,0xAB9423A7,0xFC93A039,0x655B59C3,0x8F0CCC92,0xFFEFF47D,0x85845DD1,
  0x6FA87E4F,0xFE2CE6E0,0xA3014314,0x4E0811A1,0xF7537E82,0xBD3AF235,0x2AD7D2BB,0xEB86D391
]);

// Utility functions
const addUnsigned = (X, Y) => {
  const X8 = (X & 0x80000000),
        Y8 = (Y & 0x80000000),
        X4 = (X & 0x40000000),
        Y4 = (Y & 0x40000000),
        result = (X & 0x3FFFFFFF) + (Y & 0x3FFFFFFF);

  if (X4 & Y4) {
    return (result ^ 0x80000000 ^ X8 ^ Y8);
  }

  if (X4 | Y4) {
    if (result & 0x40000000) {
      return (result ^ 0xC0000000 ^ X8 ^ Y8);
    } else {
      return (result ^ 0x40000000 ^ X8 ^ Y8);
    }
  } else {
    return (result ^ X8 ^ Y8);
  }
}

const F = (x, y, z) => (x & y) | ((~x) & z);
const G = (x, y, z) => (x & z) | (y & (~z));
const H = (x, y, z) => x ^ y ^ z;
const I = (x, y, z) => y ^ (x | (~z));

const FF = (a, b, c, d, x, s, ac) => {
  a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}
const GG = (a, b, c, d, x, s, ac) => {
  a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}
const HH = (a, b, c, d, x, s, ac) => {
  a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}
const II = (a, b, c, d, x, s, ac) => {
  a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}

export class MD5 extends Uint8Array {
  constructor () {
    super(16);
  }

  toString() {
    return this.digest();
  }

  digest () {
    return [...this].map(byteToHex).join('');
  }
}


MD5.prototype.update = function (data) {

  // step_1: 数据补位
  /*
## 1. 按位补充数据

在MD5算法中，首先需要对信息进行填充，这个数据按位(bit)补充，
要求最终的位数对512求模的结果为448。
也就是说数据补位后，其位数长度只差64位(bit)就是512的整数倍。
即便是这个数据的位数对512求模的结果正好是448也必须进行补位。
补位的实现过程：首先在数据后补一个1 bit； 接着在后面补上一堆0 bit,
直到整个数据的位数对512求模的结果正好为448。总之，至少补1位，而最多可能补512位

## 2. 扩展长度 

在完成补位后，又将一个表示数据原始长度的64 bit数补在最后。
这是对原始数据没有补位前长度的描述，用二进制来表示。 
当完成补位及补充数据的描述后，得到的结果数据长度正好是512的整数倍。
也就是说长度正好是16个(32bit) 字的整数倍
*/

  // step_2: 扩展长度
  let x = convertToWordArray(encode(data).toString());

  // step_3: 初始化MD缓存器
  // 用来保存中间变量和结果
  let a = 0b01100111010001010010001100000001,
      b = 0b11101111110011011010101110001001,
      c = 0b10011000101110101101110011111110,
      d = 0b00010000001100100101010001110110;

  const v = new DataView(this.buffer, 0);

  v.setUint32(0, a);
  v.setUint32(4, b);
  v.setUint32(8, c);
  v.setUint32(12, d);


  // step_4: 处理数据
  for (let k = 0; k < x.length; k += 16) {
      let i = -1;

      // 第一轮
      a = FF(a, b, c, d, x[k + 0], S[0], T[++i]);
      d = FF(d, a, b, c, x[k + 1], S[1], T[++i]);
      c = FF(c, d, a, b, x[k + 2], S[2], T[++i]);
      b = FF(b, c, d, a, x[k + 3], S[3], T[++i]);

      a = FF(a, b, c, d, x[k + 4], S[0], T[++i]);
      d = FF(d, a, b, c, x[k + 5], S[1], T[++i]);
      c = FF(c, d, a, b, x[k + 6], S[2], T[++i]);
      b = FF(b, c, d, a, x[k + 7], S[3], T[++i]);

      a = FF(a, b, c, d, x[k + 8],  S[0], T[++i]);
      d = FF(d, a, b, c, x[k + 9],  S[1], T[++i]);
      c = FF(c, d, a, b, x[k + 10], S[2], T[++i]);
      b = FF(b, c, d, a, x[k + 11], S[3], T[++i]);

      a = FF(a, b, c, d, x[k + 12], S[0], T[++i]);
      d = FF(d, a, b, c, x[k + 13], S[1], T[++i]);
      c = FF(c, d, a, b, x[k + 14], S[2], T[++i]);
      b = FF(b, c, d, a, x[k + 15], S[3], T[++i]);

      a = GG(a, b, c, d, x[k + 1],  S[4], T[++i]);
      d = GG(d, a, b, c, x[k + 6],  S[5], T[++i]);
      c = GG(c, d, a, b, x[k + 11], S[6], T[++i]);
      b = GG(b, c, d, a, x[k + 0],  S[7], T[++i]);

      a = GG(a, b, c, d, x[k + 5],  S[4], T[++i]);
      d = GG(d, a, b, c, x[k + 10], S[5], T[++i]);
      c = GG(c, d, a, b, x[k + 15], S[6], T[++i]);
      b = GG(b, c, d, a, x[k + 4],  S[7], T[++i]);

      a = GG(a, b, c, d, x[k + 9],  S[4], T[++i]);
      d = GG(d, a, b, c, x[k + 14], S[5], T[++i]);
      c = GG(c, d, a, b, x[k + 3],  S[6], T[++i]);
      b = GG(b, c, d, a, x[k + 8],  S[7], T[++i]);

      a = GG(a, b, c, d, x[k + 13], S[4], T[++i]);
      d = GG(d, a, b, c, x[k + 2],  S[5], T[++i]);
      c = GG(c, d, a, b, x[k + 7],  S[6], T[++i]);
      b = GG(b, c, d, a, x[k + 12], S[7], T[++i]);

      a = HH(a, b, c, d, x[k + 5],  S[8], T[++i]);
      d = HH(d, a, b, c, x[k + 8],  S[9], T[++i]);
      c = HH(c, d, a, b, x[k + 11], S[10], T[++i]);
      b = HH(b, c, d, a, x[k + 14], S[11], T[++i]);

      a = HH(a, b, c, d, x[k + 1],  S[8], T[++i]);
      d = HH(d, a, b, c, x[k + 4],  S[9], T[++i]);
      c = HH(c, d, a, b, x[k + 7],  S[10], T[++i]);
      b = HH(b, c, d, a, x[k + 10], S[11], T[++i]);

      a = HH(a, b, c, d, x[k + 13], S[8], T[++i]);
      d = HH(d, a, b, c, x[k + 0],  S[9], T[++i]);
      c = HH(c, d, a, b, x[k + 3],  S[10], T[++i]);
      b = HH(b, c, d, a, x[k + 6],  S[11], T[++i]);

      a = HH(a, b, c, d, x[k + 9],  S[8], T[++i]);
      d = HH(d, a, b, c, x[k + 12], S[9], T[++i]);
      c = HH(c, d, a, b, x[k + 15], S[10], T[++i]);
      b = HH(b, c, d, a, x[k + 2],  S[11], T[++i]);

      a = II(a, b, c, d, x[k + 0],  S[12], T[++i]);
      d = II(d, a, b, c, x[k + 7],  S[13], T[++i]);
      c = II(c, d, a, b, x[k + 14], S[14], T[++i]);
      b = II(b, c, d, a, x[k + 5],  S[15], T[++i]);

      a = II(a, b, c, d, x[k + 12], S[12], T[++i]);
      d = II(d, a, b, c, x[k + 3],  S[13], T[++i]);
      c = II(c, d, a, b, x[k + 10], S[14], T[++i]);
      b = II(b, c, d, a, x[k + 1],  S[15], T[++i]);

      a = II(a, b, c, d, x[k + 8],  S[12], T[++i]);
      d = II(d, a, b, c, x[k + 15], S[13], T[++i]);
      c = II(c, d, a, b, x[k + 6],  S[14], T[++i]);
      b = II(b, c, d, a, x[k + 13], S[15], T[++i]);

      a = II(a, b, c, d, x[k + 4],  S[12], T[++i]);
      d = II(d, a, b, c, x[k + 11], S[13], T[++i]);
      c = II(c, d, a, b, x[k + 2],  S[14], T[++i]);
      b = II(b, c, d, a, x[k + 9],  S[15], T[++i]);

      a = addUnsigned(a, v.getUint32(0));
      b = addUnsigned(b, v.getUint32(4));
      c = addUnsigned(c, v.getUint32(8));
      d = addUnsigned(d, v.getUint32(12));

  }

  // little endian value
  v.setUint32(0, a, true);
  v.setUint32(4, b, true);
  v.setUint32(8, c, true);
  v.setUint32(12, d, true);

  return this;
}

/**
 *
 * 转换
 */

function convertToWordArray(string) {
  const messageLength = string.length;
  const numberOfWords_temp1 = messageLength + 8;
  const numberOfWords_temp2 = (
    numberOfWords_temp1 - (numberOfWords_temp1 % 64)
  ) / 64;
  const numberOfWords = (numberOfWords_temp2 + 1) * 16;
  const wordArray = Array(numberOfWords - 1);

  let wordCount;
  let bytePosition = 0;
  let byteCount = 0;

  while (byteCount < messageLength) {
    wordCount = (byteCount - (byteCount % 4)) / 4;
    bytePosition = (byteCount % 4) * 8;
    wordArray[wordCount] = wordArray[wordCount] | (string.charCodeAt(byteCount) << bytePosition);
    byteCount++;
  }

  wordCount = (byteCount - (byteCount % 4)) / 4;
  bytePosition = (byteCount % 4) * 8;

  wordArray[wordCount] = wordArray[wordCount] | (0x80 << bytePosition);
  wordArray[numberOfWords - 2] = messageLength << 3;
  wordArray[numberOfWords - 1] = messageLength >>> 29;

  return wordArray;
}
