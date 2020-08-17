/**
 * *****************************************************************************
 *
 * MD5 Algorithm 
 * =============
 *
 * MD5(Message-Digest Algorithm 5 信息摘要算法版本5),
 * 一种密码散列函数,产生出一个16字节(128位)的校验值,用于确保信息传输完整一致.
 *
 * # 主要特点
 *
 * * 稳定、运算速度快;
 * * 压缩性：输入任意长度的数据，输出长度固定（128 比特位);
 * * 运算不可逆：已知运算结果的情况下，无法通过通过逆运算得到原始字符串;
 * * 高度离散：输入的微小变化，可导致运算结果差异巨大;
 *
 * # 主要用途
 *
 * * 防止数据篡改
 * * 信息保密 
 *
 * # MD5算法的原理
 *
 * MD5码以512位分组来处理输入的信息，且每一分组又被划分为16个32位子分组，
 * 经过处理后，输出由四个32位即128位散列值。
 *
 * # 算法步骤
 *
 * ## 1. 按位补充数据
 *
 * 在MD5算法中，首先需要对信息进行填充，这个数据按位(bit)补充，
 * 要求最终的位数对512求模的结果为448。
 * 也就是说数据补位后，其位数长度只差64位(bit)就是512的整数倍。
 * 即便是这个数据的位数对512求模的结果正好是448也必须进行补位。
 * 补位的实现过程：首先在数据后补一个1 bit； 接着在后面补上一堆0 bit,
 * 直到整个数据的位数对512求模的结果正好为448。总之，至少补1位，而最多可能补512位
 *
 * ## 2. 扩展长度 
 *
 * 在完成补位后，又将一个表示数据原始长度的64 bit数补在最后。
 * 这是对原始数据没有补位前长度的描述，用二进制来表示。 
 * 当完成补位及补充数据的描述后，得到的结果数据长度正好是512的整数倍。
 * 也就是说长度正好是16个(32bit) 字的整数倍
 *
 * ## 3. 初始化MD缓存器
 *
 * MD5运算要用到一个128位的MD5缓存器，用来保存中间变量和最终结果。
 * 该缓存器又可看成是4个32位的寄存器A、B、C、D，初始化为:
 *
 * * A： 01 23 45 67
 * * B： 89 ab cd ef
 * * C： fe dc ba 98
 * * D： 76 54 32 10
 *
 * ## 4. 处理数据段
 *
 * 首先定义4个非线性函数F、G、H、I，对输入的报文运算以512位数据段为单位进行处理。
 * 对每个数据段都要进行4轮的逻辑处理，在4轮中分别使用4个不同的函数F、G、H、I。
 * 每一轮以ABCD和当前的512位的块为输入，处理后送入ABCD(128位)。
 *
 * ## 5. 输出
 *
 * 信息摘要最终处理成以A, B, C, D 的形式输出。
 * 也就是开始于A的低位在前的顺序字节，结束于D的高位在前的顺序字节。
 *
 *
 * *****************************************************************************
 */

import md5_Utf8Encode from './utf8.mjs';

export default function md5(string) {

  function md5_RotateLeft(lValue, iShiftBits) {
    // 左移iShift bits
    // 右移32-iShift bits
    // 按位或前2步结果
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function md5_AddUnsigned(lX, lY) {
    const b31z   = 0b10000000000000000000000000000000; // 1<<31>>>0
    const b30z   = 0b01000000000000000000000000000000; // 1<<30>>>0
    const b30o   = 0b00111111111111111111111111111111;
    const b1130z = 0b11000000000000000000000000000000; // 0b11<<30>>>0

    const lX8 = (lX & b31z),
          lY8 = (lY & b31z),
          lX4 = (lX & b30z),
          lY4 = (lY & b30z),
          lResult = (lX & b30o) + (lY & b30o);

    if (lX4 & lY4) {
      return (lResult ^ b31z ^ lX8 ^ lY8);
    }

    if (lX4 | lY4) {
      if (lResult & b30z) {
        return (lResult ^ b1130z ^ lX8 ^ lY8);
      } else {
        return (lResult ^ b30z ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }

  function md5_F(x, y, z) {
    // 按位与xy
    // 按位非x后按位与z 
    // 按位或以上两步的结果
    return (x & y) | ((~x) & z);
  }

  function md5_G(x, y, z) {
    // 按位与xz
    // 按位非z后按位与y 
    // 按位或以上两步的结果
    return (x & z) | (y & (~z));
  }

  function md5_H(x, y, z) {
    // 按位亦或xyz
    return (x ^ y ^ z);
  }

  function md5_I(x, y, z) {
    // 按位非z后按位或x 
    // 按位异或y
    return (y ^ (x | (~z)));
  }

  function md5_FF(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  
  function md5_GG(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  
  function md5_HH(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  
  function md5_II(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }

  /**
   *
   *
   */

  function md5_ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (
      lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)
    ) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;

    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | 
        (string[lByteCount] << lBytePosition));
      lByteCount++;
    }

    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (128 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function md5_WordToHex(lValue) {
    let HexValue = "";

    for (let i = 0; i <= 3; i++) {
      const lByte = (lValue >>> (i << 3)) & 0b11111111; // 右移、按位与取出1字节
      const HexValue_temp = "0" + lByte.toString(16);
      HexValue = HexValue + HexValue_temp.substr(HexValue_temp.length - 2, 2);
    }

    return HexValue;
  }

  // step_1: 数据补位
  // step_2: 扩展长度
  let x = md5_ConvertToWordArray(md5_Utf8Encode(string));

  // step_3: 初始化寄存器
  let a = 0b01100111010001010010001100000001,
      b = 0b11101111110011011010101110001001,
      c = 0b10011000101110101101110011111110,
      d = 0b00010000001100100101010001110110;

  const S11 = 7, S12 = 12, S13 = 17, S14 = 22, 
        S21 = 5, S22 = 9,  S23 = 14, S24 = 20,
        S31 = 4, S32 = 11, S33 = 16, S34 = 23,
        S41 = 6, S42 = 10, S43 = 15, S44 = 21; 

  // step_4: 处理数据
  for (let k = 0; k < x.length; k += 16) {
      let AA = a,
          BB = b,
          CC = c,
          DD = d;

      a = md5_FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
      d = md5_FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
      c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
      b = md5_FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);

      a = md5_FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
      d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
      c = md5_FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
      b = md5_FF(b, c, d, a, x[k + 7], S14, 0xFD469501);

      a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
      d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
      c = md5_FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
      b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);

      a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
      d = md5_FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
      c = md5_FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
      b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49B40821);

      a = md5_GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
      d = md5_GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
      c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
      b = md5_GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);

      a = md5_GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
      d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = md5_GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
      b = md5_GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);

      a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
      d = md5_GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
      c = md5_GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
      b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);

      a = md5_GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
      d = md5_GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
      c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
      b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);

      a = md5_HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
      d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
      c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
      b = md5_HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);

      a = md5_HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
      d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
      c = md5_HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
      b = md5_HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);

      a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
      d = md5_HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
      c = md5_HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
      b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881D05);

      a = md5_HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
      d = md5_HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
      c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
      b = md5_HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);

      a = md5_II(a, b, c, d, x[k + 0], S41, 0xF4292244);
      d = md5_II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
      c = md5_II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
      b = md5_II(b, c, d, a, x[k + 5], S44, 0xFC93A039);

      a = md5_II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
      d = md5_II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
      c = md5_II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
      b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845DD1);

      a = md5_II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
      d = md5_II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
      c = md5_II(c, d, a, b, x[k + 6], S43, 0xA3014314);
      b = md5_II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);

      a = md5_II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
      d = md5_II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
      c = md5_II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
      b = md5_II(b, c, d, a, x[k + 9], S44, 0xEB86D391);

      a = md5_AddUnsigned(a, AA);
      b = md5_AddUnsigned(b, BB);
      c = md5_AddUnsigned(c, CC);
      d = md5_AddUnsigned(d, DD);
  }

  // setp_5: 输出
  return (md5_WordToHex(a) + 
          md5_WordToHex(b) + 
          md5_WordToHex(c) + 
          md5_WordToHex(d)).toLowerCase();
}
