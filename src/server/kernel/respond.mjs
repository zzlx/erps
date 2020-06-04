/**
 * *****************************************************************************
 *
 * Respond处理器
 *
 * 支持特性:
 * 内容协商
 * 内容压缩
 * 系统错误
 *
 * *****************************************************************************
 */

import http from 'http';
import http2 from 'http2';
import Stream from 'stream';
import zlib from 'zlib';
import util from 'util';
import { EMPTY_CODE } from './constants.mjs';

const debug = util.debuglog('debug:application.respond'); // debug function

export default function respond (ctx, error) {
  if (false === ctx.respond) {
		debug('Bypassing respond, (ctx.respond === false)');
		return; 
	}

  let body = ctx.body;

  if (error != null) {
    ctx.app.emit('error', error);

    // ENOENT support
    if ('ENOENT' == error.code) ctx.status = 404;

    // default to 500
    if ('number' != typeof error.status || !http.STATUS_CODES[error.status]) {
      ctx.status = http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR; // 500
    }

    if ('development' === ctx.app.env) {
      body = error.stack;
    } else {
      body = http.STATUS_CODES[error.status];
    }

  }

  if (!ctx.writable) {
		debug('Can not write to stream, because ctx.writable is false.');
		return;
	}

  if (EMPTY_CODE.includes(ctx.status)) {
    ctx.body = null;
		debug(`End respond stream, content ${http['STATUS_CODES'][ctx.status]}`);
    return ctx.stream.end(); // 结束stream
  }

  if ('HEAD' == ctx.method || 'OPTIONS' == ctx.method) {
    if (!ctx.headersSent && !ctx.has('Content-Length')) {
      //ctx.length 
    }

    ctx.stream.respond(body);

		debug(`End respond for ${ctx.method} method.`);
    return ctx.stream.end();
  }

  // null body
  if (null == body || false === body || true === body) {
    ctx.status = 404;
    body = ctx.message;
  }

  // 响应文本内容
  if (Buffer.isBuffer(body) || 'string' == typeof body) {
    if (!ctx.headersSent) contentNegotiation();
  }

	// stream body
  if (body instanceof Stream) {
    ctx.stream.respond(body);
    return body.pipe(ctx.stream);
  }

  // Assume body is a json value
	if (typeof body === 'object') {
		ctx.type = 'json';
		body = JSON.stringify(body);
	}

	// send response headers
  if (!ctx.headersSent) {
		compress(500); // compress content bigger than 500kb
		ctx.stream.respond(ctx.response.headers);
  }


	if (ctx.writable) {
		debug('End respond: body =', body);
		return ctx.stream.end(body);
	} else {
		debug('End respond with no writable.');
		return ctx.stream.end();
	} // end respond

	// compress content
	function compress (size = 500) {
    ctx.length = Buffer.byteLength(body);

		// less than size
		if (ctx.length <= 1024 * size) return;

		let encoding = ctx.get('accept-encoding');

		if (/\bbr\b/.test(encoding)) {
			ctx.set('content-encoding', 'br');
			ctx.set('vary', 'accept-encoding');
			body = zlib.brotliCompressSync(body);
		} else if (/\bdefate\b/.test(encoding)) {
			ctx.set('content-encoding', 'deflate');
			ctx.set('vary', 'accept-encoding');
			body = zlib.deflateSync(body);
		} else if (/\bgzip\b/.test(encoding)) {
			ctx.set('content-encoding', 'gzip');
			ctx.set('vary', 'accept-encoding');
			body = zlib.gzipSync(body);
    }

    ctx.length = Buffer.byteLength(body); // 重新计算内容大小

		debug(`compress content use ${ctx.get('content-encoding')}.`);
	} // end of comporess function

	// 内容协商逻辑
	function contentNegotiation () {

		if (ctx.accepts('html')) {
			ctx.type = 'html';
			// @todo: 应用html模版
			body = `<html>${body}</html>`;
		} else if (ctx.accepts('json')) {
			ctx.type = 'json';
			body = `{"data": ${body}}`;
		} else if (ctx.accepts('xml')) {
			ctx.type = 'xml';
			body = `<data>${body}</data>`;
		} else {
			ctx.type = 'text';
		}
	} // end of content negotiation

}

