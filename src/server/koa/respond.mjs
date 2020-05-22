/**
 * *****************************************************************************
 *
 * 响应输出
 *
 * *****************************************************************************
 */

import http from 'http';
import https from 'https';
import Stream from 'stream';
import zlib from 'zlib';
import util from 'util';
const debug = util.debuglog('debug:respond'); // debug function

const RES_HEADERS = Symbol.for('context#response_headers');

export default function respond (ctx) {
  // allow bypassing.
  if (false === ctx.respond) return; 

  if (!ctx.writable) return;

  let body = ctx.body;

  const code = ctx.status;
  // ignore body
  // 204: no content
  // 205: reset content
  // 304: not modified
  const emptyCode = [204, 205, 304];
  if (emptyCode.includes(code)) {
    ctx.body = null;
    return ctx.stream.end();
  }

  if ('HEAD' == ctx.method || 'OPTIONS' == ctx.method) {
    if (!ctx.headersSent && !ctx.has('Content-Length')) {
      //ctx.length 
    }

    ctx.stream.respond(ctx[RES_HEADERS]);
    return ctx.stream.end();
  }

  // status body
  if (null == body) {
    ctx.status = 404;

    if (ctx.httpVersion >= 2) {
      body = ctx.message;
    } else {
      body = ctx.message || String(code);
    }

    if (!ctx.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
      ctx.stream.respond(ctx[RES_HEADERS]);
    }

    if (ctx.writable) {
      return ctx.stream.end(body);
    } else {
      return ctx.stream.end();
    }
  }

  // responses
  if (Buffer.isBuffer(body) || 'string' == typeof body) {
		debug('headers', ctx[RES_HEADERS]);
    ctx.stream.respond(ctx[RES_HEADERS]);
    return ctx.stream.end(body);
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

