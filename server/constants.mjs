/**
 * *****************************************************************************
 *
 * Constants
 *
 *
 *
 * *****************************************************************************
 */

import http2 from 'http2';

// 初始化存储器
export const HTTP2_METHOD = [];
export const HTTP2_HEADER = Object.create(null);
export const HTTP_STATUS  = Object.create(null);
export const HTTP_STATUS_CODES  = Object.create(null);
export const HTTP_STATUS_EMPTY_CODES = [ 204, 205, 304, ];
export const HTTP_STATUS_REDIRECT_CODES = [ 300, 301, 302, 303, 305, 307, 308, ];

// define symbol constants
export const ACCEPT      = Symbol('context#accept');
export const REQ_BODY    = Symbol('context#request-body');
export const REQ_HEADERS = Symbol('context#request-headers');
export const REQ_URL     = Symbol('context#request-URL');
export const REQ_IP      = Symbol('context#request-ip');
export const RES_BODY    = Symbol('context#response-body');
export const RES_HEADERS = Symbol('context#response-headers');

// 遍历赋值
for (const key of Object.keys(http2.constants)) {
  if (key.substr(0, 12) === 'HTTP2_HEADER') {
    HTTP2_HEADER[key.substr(13)] = http2.constants[key]; 
    continue;
  }

  if (key.substr(0, 12) === 'HTTP2_METHOD') {
    HTTP2_METHOD.push(http2.constants[key]); 
    continue;
  }

  if (key.substr(0, 11) === 'HTTP_STATUS') {
    HTTP_STATUS[key.substr(12)] = http2.constants[key];
    HTTP_STATUS_CODES[http2.constants[key]] = key.substr(12).replace('_', ' '); 
    continue;
  }
}

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

export const CLEAR_PAGE = process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H';
export const CLEAR_LINE = '\x1B[0K';
export const MOVE_LEFT = '\x1B[1000D';
export const MOVE_UP = '\x1B[1A';
