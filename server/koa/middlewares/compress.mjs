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
    // 未设置body时不进入压缩
    if (null == ctx.body) return next();

    // threshold size
    const size = ctx.app.compressThreshold * 1024;

    if (ctx.length && ctx.length <= size) return next();

    // stream时暂不进行压缩
    // 
    // @todo: 流压缩支持
    if (ctx.body && typeof ctx.body.pipe === 'function') return next();

    ctx.set('vary', 'accept-encoding');

    const encoding = this.get('accept-encoding');

    if (/\bbr\b/.test(encoding)) {
      ctx.set('content-encoding', 'br');
      ctx.body = zlib.brotliCompressSync(ctx.body);
      //retval = zlib.createBrotliCompress();
    } else if (/\bdeflate\b/.test(encoding)) {
      ctx.set('content-encoding', 'deflate');
      ctx.body = zlib.deflateCompressSync(ctx.body);
      //retval = stream.pipline(value, zlib.createDeflate())
    } else if (/\bgzip\b/.test(encoding)) {
      ctx.set('content-encoding', 'gzip');
      ctx.body = zlib.gzipSync(ctx.body);
      //retval = stream.pipline(value, zlib.createGzip())
    }

    ctx.length = Buffer.byteLength(ctx.body); // 重新计算内容大小

    return next();
  } 
} 
