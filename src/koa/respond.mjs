/**
 * *****************************************************************************
 *
 * 服务器端响应程序
 *
 * *****************************************************************************
 */

import assert from 'assert';

import { HTTP_STATUS_EMPTY_CODES } from './constants.mjs';

export default function respond (ctx) {
  if (ctx.respond === false) return ctx.stream.end(); // allow bypassing respond

  // 设置status为默认值为404
  if (null == ctx.status) ctx.status = 404; // set 404 status

  if (null == ctx.body) {
    ctx.body = ctx.status + ": " + ctx.message; // set string message
  }

  // response headers
  if (ctx.headersSent === false) {
    ctx.stream.respond(ctx.response.headers, {
      endStream: HTTP_STATUS_EMPTY_CODES.includes(ctx.status) ? true : false, 
      waitForTrailers: false, 
    });
  }

  // respond contents
  if ('HEAD' === ctx.method)  return ctx.stream.end();
  if (ctx.writable === false) return ctx.stream.end();
  if (Buffer.isBuffer(ctx.body)) return ctx.stream.end(ctx.body);
  if (typeof ctx.body === 'string') return ctx.stream.end(ctx.body);
  if (typeof ctx.body.pipe === 'function') return ctx.body.pipe(ctx.stream);
  return ctx.stream.end(); // respond with no content
}
