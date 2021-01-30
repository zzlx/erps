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
  CONTINUE: 0,
  TEXT: 1,
  BINARY: 2,
  CLOSE: 8,
  PING: 9,
  PONG: 10,
};

export const WEBSOCKET_STATUS_CODES = {
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Unsupported Data',
}
