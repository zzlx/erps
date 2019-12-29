/**
 * Static resource server service
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

export default (options = {}) => {
  const opts = {};

  if ('string' === typeof options) opts.root = options;
  if (null == opts.root) {
    throw new Error('请提供静态资源目录配置');
  }
  opts.index = opts.index || 'index.html';
  opts.directoryIndex = opts.directoryIndex || ['index.html'],
  opts.immutable = opts.immutable || false;
  opts.maxage = opts.maxage || 0;
  opts.compress = opts.compress || false;

  return async function staticsMiddleware (ctx, next) {

    // only accept GET/HEAD/OPTIONS method
    if (!/(GET|HEAD|OPTIONS)/.test(ctx.method)) {
      ctx.status = 405; // method not allowed.
      ctx.set('Allow', 'GET, HEAD, OPTIONS');
      return await next();
    }

    const relativePath = path.relative('/', ctx.pathname);
    let realPath = path.resolve(opts.root, relativePath);
    let url = null;

    if (realPath === opts.root) {
      realPath = path.join(realPath, 'index.html');
    }

    if (fs.existsSync(realPath)) {
      url = realPath;
    }

    // @todo: 完善资源最后修改时间戳对比逻辑
    const lastModified = ctx.get('if-modified-since');

    // get accept encoding
    const accetpEncoding = ctx.get('accept-encoding');

    // set content-encoding
    if (/\bbr\b/.test(accetpEncoding) && fs.existsSync(realPath + '.br')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'br');
      url = realPath + '.br';
    } else if (/\bdeflate\b/.test(accetpEncoding) && fs.existsSync(realPath + '.deflate')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'deflate');
      url = realPath + '.deflate';
    } else if (/\bgzip\b/.test(accetpEncoding) && fs.existsSync(realPath + '.gz')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'gzip');
      url = realPath + '.gz';
    }

    // set content-type
    if (null === url || url === opts.root) {
      url = path.join(opts.root, 'index.html');
      ctx.type = path.extname(url);
    } else {
      ctx.type = path.extname(realPath);
    } 

    let stats = null;

    // 读取文件
    try {
      stats = fs.lstatSync(url);
      ctx.set('last-modified', new Date(stats.mtimeMs).toUTCString());
      ctx.body = fs.createReadStream(url);
    } catch (err) {
      ctx.body = err;
      console.log('static middleware error: ', err);
    } finally {
    }
  }
}
