/**
 * *****************************************************************************
 *
 * Response
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

const debug = util.debuglog('debug:application.respond'); // debug function

/**
 * response
 *
 *
 * @param {object} ctx
 * @return 
 */

export default function respond (ctx) {

  if (false === ctx.respond) {
		debug('Respond is bypassed, ctx.respond was set to false.');
		return; 
	}

  if (!ctx.writable) {
		debug('Can not write to stream, ctx.writable is false.');
		return;
	}

  const EMPTY_CODE = [
    204, // no content
    205, // reset content
    304, // not modified
  ];

  if (EMPTY_CODE.includes(ctx.status)) {
    ctx.body = null;
		debug(`Respond stream, content ${http['STATUS_CODES'][ctx.status]}`);
    return ctx.stream.end(); // 结束stream
  }

  if ('HEAD' == ctx.method || 'OPTIONS' == ctx.method) {
    if (!ctx.headersSent && !ctx.has('Content-Length')) {
      //ctx.length 
    }

    ctx.stream.respond(body);

		debug(`Respond for ${ctx.method} method.`);
    return ctx.stream.end();
  }

  // null body
  if (null == ctx.body || false === ctx.body || true === ctx.body) {
    ctx.status = ctx.status || 404;
    ctx.body = ctx.message;
  }

	// stream body
  if (ctx.body instanceof Stream) {
    ctx.stream.respond(ctx.body);
    return ctx.body.pipe(ctx.stream);
  }

  // Assume body is a json value
	if (typeof ctx.body === 'object') {
		ctx.type = 'json';
		ctx.body = JSON.stringify(ctx.body);
	}

	// send response headers
  if (!ctx.headersSent) {
		compress(ctx, 500); // compress content bigger than 500kb
		ctx.stream.respond(ctx.response.headers);
  }

	if (ctx.writable) {
		return ctx.stream.end(ctx.body);
	} else {
		debug('End respond with no writable.');
		return ctx.stream.end();
	} // end respond
} // end of respond

/**
 *
 *
 */

function compress (ctx, size = 500) {
	// compress content
  const body = ctx.body || '';

  ctx.length = Buffer.byteLength(body);

	// less than size
	if (ctx.length <= 1024 * size) return;

	let encoding = ctx.get('accept-encoding');

	if (/\bbr\b/.test(encoding)) {
		ctx.set('content-encoding', 'br');
		ctx.set('vary', 'accept-encoding');
		ctx.body = zlib.brotliCompressSync(body);
    ctx.length = Buffer.byteLength(ctx.body); // 重新计算内容大小
	} else if (/\bdefate\b/.test(encoding)) {
		ctx.set('content-encoding', 'deflate');
		ctx.set('vary', 'accept-encoding');
		ctx.body = zlib.deflateSync(body);
    ctx.length = Buffer.byteLength(ctx.body); // 重新计算内容大小
	} else if (/\bgzip\b/.test(encoding)) {
		ctx.set('content-encoding', 'gzip');
		ctx.set('vary', 'accept-encoding');
		ctx.body = zlib.gzipSync(body);
    ctx.length = Buffer.byteLength(ctx.body); // 重新计算内容大小
  }
} // end of comporess function
