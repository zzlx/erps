/**
 * *****************************************************************************
 *
 * 实时内容压缩支持
 *
 * 静态资源不推荐使用实时内容压缩
 *
 * @param {object} options 
 * @return {function} middleware function
 * *****************************************************************************
 */

import zlib from 'zlib';

export default function (options = {}) {
  const opts = Object.assign({}, {
    threshold: 512*1024, // 512kb
  }, options);

  return function compressMiddleware (ctx, next) {
    if (null == ctx.body) return next(); // null body
    if (ctx.length && ctx.length <= opts.threshold) return next(); // length threshold
    if (ctx.get('content-encoding') !== '') return next(); // 已设置content-encoding时不压缩

    ctx.set('vary', 'accept-encoding');
    const encoding = this.get('accept-encoding');
    const body = ctx.body;
    const isStream = body && typeof body.pipe === 'function';
    if (isStream) return next();

    if (/\bdeflate\b/.test(encoding)) {
      ctx.set('content-encoding', 'deflate');
      if (isStream) ctx.body = body.pipe(zlib.createDeflate());
      else ctx.body = zlib.deflateCompressSync(body);
    } else if (/\bgzip\b/.test(encoding)) {
      ctx.set('content-encoding', 'gzip');
      if (isStream) ctx.body = body.pipe(zlib.createGzip());
      else ctx.body = zlib.gzipSync(ctx.body);
    } else if (/\bbr\b/.test(encoding)) {
      ctx.set('content-encoding', 'br');
      if (isStream) ctx.body = body.pipe(zlib.createBrotliCompress());
      else ctx.body = zlib.brotliCompressSync(ctx.body);
    } 

    if (!isStream) ctx.length = Buffer.byteLength(ctx.body); // 重新计算内容大小
    else ctx.remove('content-encoding');

    return next();
  } 
} 
