/**
 * *****************************************************************************
 *
 * 内容响应处理程序
 *
 * 特性:
 * 支持内容协商
 * 支持压缩
 *
 *
 * *****************************************************************************
 */

import http from 'http';
import https from 'https';
import Stream from 'stream';
import zlib from 'zlib';
import util from 'util';
import { RES_HEADERS, EmptyCode } from './constants.mjs';
const debug = util.debuglog('debug:respond'); // debug function

export default function respond (ctx) {

  // bypassing respond.
  if (false === ctx.respond) return; 

  if (!ctx.writable) return;

  let body = ctx.body;

  const code = ctx.status;

  if (EmptyCode.includes(code)) {
    ctx.body = null;
    return ctx.stream.end(); // 结束respond
  }

  if ('HEAD' == ctx.method || 'OPTIONS' == ctx.method) {
    if (!ctx.headersSent && !ctx.has('Content-Length')) {
      //ctx.length 
    }

    ctx.stream.respond(ctx[RES_HEADERS]);
    return ctx.stream.end();
  }

  // null body
  if (null == body) {
    ctx.status = 404;
    body = ctx.message;
  }

  // 响应文本内容
  if (Buffer.isBuffer(body) || 'string' == typeof body) {
    if (!ctx.headersSent) {
			// 内容协商
			// 优先响应html 
			if (ctx.accepts('html')) {
				ctx.type = 'html';
				// @todo: 应用html模版
				body = `<p>${body}<p>`;
			} else if (ctx.accepts('json')) {
				ctx.type = 'json';
				body = `{"data": ${body}}`;
			} else if (ctx.accepts('xml')) {
				ctx.type = 'xml';
				body = `<data>${body}</data>`;
			} else {
				ctx.type = 'text';
			}

			ctx.stream.respond(ctx[RES_HEADERS]);
		}

		if (!ctx.writable) return ctx.stream.end();
		else return ctx.stream.end(body);
  }

	// stream
  if (body instanceof Stream) {
    ctx.stream.respond(ctx[RES_HEADERS]);
    return body.pipe(ctx.stream);
  }

  // Assume body is a json value
  body = JSON.stringify(body);

  if (!ctx.headersSent) {
    ctx.length = Buffer.byteLength(body);

    // only compress filesize gretter than 100kb
    if (ctx.length > 1024 * 100) {
      if (/\bbr\b/.test(ctx.get('accept-encoding'))) {
        ctx.set('content-encoding', 'br');
        ctx.set('vary', 'accept-encoding');
        body = zlib.brotliCompressSync(body);

      } else if (/\bdefate\b/.test(ctx.get('accept-encoding'))) {
        ctx.set('content-encoding', 'deflate');
        ctx.set('vary', 'accept-encoding');
        body = zlib.deflateSync(body);

      } else if (/\bgzip\b/.test(ctx.get('accept-encoding'))) {
        ctx.set('content-encoding', 'gzip');
        ctx.set('vary', 'accept-encoding');
        body = zlib.gzipSync(body);

      }

      ctx.length = Buffer.byteLength(body);
    }
  }

  ctx.stream.respond(ctx[RES_HEADERS]);
  ctx.stream.end(body);
}
