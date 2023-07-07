/**
 * *****************************************************************************
 *
 * Constants variables
 *
 * *****************************************************************************
 */

import http2 from "http2";

export const CLEAR_PAGE = "\x1B[2J\x1B[3J\x1B[H";
export const CLEAR_PAGE_WIN = "\x1B[2J\x1B[0f";
export const CLEAR_LINE = "\x1B[0K";
export const MOVE_LEFT = "\x1B[1000D";
export const MOVE_UP = "\x1B[1A";
export const BLOCK_EMPTY = "░";
export const BLOCK_CELL = "▓";

// System canstants
// export * from "./app-frontend/constants.mjs";

// Http constants
export const HTTP2_METHOD = [];
export const HTTP2_HEADER = Object.create(null);
export const HTTP_STATUS  = Object.create(null);
export const HTTP_STATUS_CODES  = Object.create(null);

for (const key of Object.keys(http2.constants)) {
  if (key.substr(0, 12) === "HTTP2_HEADER") {
    HTTP2_HEADER[key.substr(13)] = http2.constants[key]; 
    continue;
  }

  if (key.substr(0, 12) === "HTTP2_METHOD") {

    HTTP2_METHOD.push(http2.constants[key]); 
    continue;
  }

  if (key.substr(0, 11) === "HTTP_STATUS") {
    HTTP_STATUS[key.substr(12)] = http2.constants[key];
    HTTP_STATUS_CODES[http2.constants[key]] = key.substr(12).replace("_", " "); 
    continue;
  }
}

export const HTTP_STATUS_EMPTY_CODES = [ 
  HTTP_STATUS.NO_CONTENT,    // 204
  HTTP_STATUS.RESET_CONTENT, // 205
  HTTP_STATUS.NOT_MODIFIED,  // 304
];

export const HTTP_STATUS_REDIRECT_CODES = [ 
  HTTP_STATUS.MULTIPLE_CHOICES,   // 300
  HTTP_STATUS.MOVED_PERMANENTLY,  // 301
  HTTP_STATUS.FOUND,              // 302
  HTTP_STATUS.SEE_OTHER,          // 303
  HTTP_STATUS.USE_PROXY,          // 305
  HTTP_STATUS.TEMPORARY_REDIRECT, // 307
  HTTP_STATUS.PERMANENT_REDIRECT, // 308
];
