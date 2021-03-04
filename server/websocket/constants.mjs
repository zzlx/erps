/**
 * *****************************************************************************
 *
 * Constants
 *
 *
 *
 * *****************************************************************************
 */

export const WEBSOCKET_OPCODES = {
  CONTINUE: 0x0,

  // non-control frame opcodes
  TEXT:     0x1,
  BINARY:   0x2,
  // 0x3-0x7

  // control frame opcodes
  CLOSE:    0x8,
  PING:     0x9,
  PONG:     0xA,
}

// opcode value:
// * 0b0000 denotes a continuation frame
// * 0b0001 denotes a text frame
// * 0b0010 denotes a binary frame
// * 3-7 are reserved for further non-control frames
// * 0b1000 denotes a connection close
// * 0b1001 denotes a ping
// * 0b1010 denotes a pong
// 11-15 are reserved for further control frames

export const WEBSOCKET_STATUS_CODES = {
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Unsupported Data',
  1004: 'Reserved',
  1007: 'Data Type Error',
  1008: 'Violates Policy',
  1009: 'Too Big to Process',
}
