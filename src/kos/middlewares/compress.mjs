/**
 * *****************************************************************************
 *
 * 内容压缩中间件
 *
 * 支持内容压缩
 *
 *
 * *****************************************************************************
 */

import zlib from 'zlib';

export default function (opts) {
  return function compressMiddleware (ctx, next) {
    const body = ctx.body;

    if (null == body) return next();

    // 旁路stream
    // @todo: 流压缩支持
    if (body && typeof body.pipe === 'function') return next();

    // threshold size
    const size = ctx.app.opts.compressThreshold * 1024;
    if (ctx.length && ctx.length <= size) return next();

    ctx.set('vary', 'accept-encoding');

    const encoding = this.get('accept-encoding');

    if (/\bbr\b/.test(encoding)) {
      ctx.set('content-encoding', 'br');
      ctx.body = zlib.brotliCompressSync(body);
      //retval = zlib.createBrotliCompress();
    } else if (/\bdeflate\b/.test(encoding)) {
      ctx.set('content-encoding', 'deflate');
      ctx.body = zlib.deflateCompressSync(body);
      //retval = stream.pipline(value, zlib.createDeflate())
    } else if (/\bgzip\b/.test(encoding)) {
      ctx.set('content-encoding', 'gzip');
      ctx.body = zlib.gzipSync(body);
      //retval = stream.pipline(value, zlib.createGzip())
    }

    ctx.length = Buffer.byteLength(ctx.body); // 重新计算内容大小

    return next();
  } 
} 
