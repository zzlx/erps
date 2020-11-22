/**
 * *****************************************************************************
 *
 * 获取系统字节序列
 *
 * BIG_ENDIAN: BE大端序
 * LITTLE_ENDIAN: LE小端序
 *
 * *****************************************************************************
 */

export default function getPlatformEndianness() {
  let arr32 = Uint32Array.of(0x12345678); // 
  let arr8 = new Uint8Array(arr32.buffer);

  switch ((arr8[0]*0x1000000) + (arr8[1]*0x10000) + (arr8[2]*0x100) + (arr8[3])) {
    case 0x12345678:
      return 'BE';
    case 0x78563412:
      return 'LE';
    default:
      throw new Error('Unknown endianness');
  }
}
