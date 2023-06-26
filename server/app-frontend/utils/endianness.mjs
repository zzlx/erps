/**
 * *****************************************************************************
 *
 * 获取系统字节序列
 *
 * *****************************************************************************
 */

const u32 = Uint32Array.of(0x12345678); // 
const u8 = new Uint8Array(u32.buffer);

export function endianness() {
  switch ((u8[0] << 24) + (u8[1] << 16) + (u8[2] << 8) + (u8[3])) {
    case 0x12345678:
      // BIG_ENDIAN: BE大端序
      return 'BE';
    case 0x78563412:
      // LITTLE_ENDIAN: LE小端序
      return 'LE';
    default:
      throw new Error('Unknown endianness');
  }
}
