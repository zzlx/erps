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
    // length threshold
    if (ctx.length && ctx.length <= opts.threshold) return next(); 
    // 已设置content-encoding时不压缩
    if (ctx.get('content-encoding') !== '') return next(); 

    ctx.set('vary', 'accept-encoding');
    const encoding = this.get('accept-encoding');
    const body = ctx.body;

    // stream 模式不启用压缩
    if (body && typeof body.pipe === 'function') return next();

    if (/\bdeflate\b/.test(encoding)) {
      ctx.set('content-encoding', 'deflate');
      ctx.body = zlib.deflateCompressSync(body);
    } else if (/\bgzip\b/.test(encoding)) {
      ctx.set('content-encoding', 'gzip');
      ctx.body = zlib.gzipSync(ctx.body);
    } else if (/\bbr\b/.test(encoding)) {
      ctx.set('content-encoding', 'br');
      ctx.body = zlib.brotliCompressSync(ctx.body);
    } 

    ctx.length = Buffer.byteLength(ctx.body); // 重新计算内容大小

    return next();
  } 
} 
