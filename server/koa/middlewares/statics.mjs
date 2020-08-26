/**
 * *****************************************************************************
 *
 * Statics中间件
 *
 * 功能描述:
 *
 * 静态资源服务
 * 内容协商
 * 缓存策略支持:通过ETag实现缓存逻辑
 * 压缩版本支持
 *
 * @param {object|string} opts
 * @return {function} middleware function
 * @api public
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import { assert } from '../../utils.mjs';

const debug = util.debuglog('debug:statics-middleware');

export default (options = {}) => {
  const opts = Object.assign({}, {
    compress: false,
    directoryIndex: ['index.html'],
    immutable: false,
    index: 'index.html',
    maxAge: 12*60*60, // 默认缓存12小时
    root: null,
    lastModified: true,
    rewrite: true, // 重定向
  }, typeof options === 'string' ? { root: options } : options);

  assert(opts.root, 'You must provider the static path as the root path.');

  return async function staticsMiddleware (ctx, next) {

    // only accept GET/HEAD/OPTIONS method
    if (!/(GET|HEAD|OPTIONS)/.test(ctx.method)) {
      ctx.status = 405; // method not allowed.
      ctx.set('Allow', 'GET, HEAD, OPTIONS');
      return await next();
    }

    // get relative path from pathname
    // set absolute path
    const relativePath = path.relative('/', ctx.pathname);
    const absolutePath = path.resolve(opts.root, relativePath);

    let url = absolutePath;
    let callbackURL = path.join(opts.root, 'index.html'); 

    // 路径构造逻辑
    // 不含文件扩展名的路径rewrite为callbackURL
    if (path.extname(url) === '') url = callbackURL;

    // get accept encoding
    const accetpEncoding = ctx.get('accept-encoding');

    ctx.type = path.extname(url); // set content-type

    // content negotiation
    if (/\bbr\b/.test(accetpEncoding) && fs.existsSync(url + '.br')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'br');
      url += '.br';
    } else if (/\bdeflate\b/.test(accetpEncoding) && fs.existsSync(url + '.deflate')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'deflate');
      url += '.deflate';
    } else if (/\bgzip\b/.test(accetpEncoding) && fs.existsSync(url + '.gz')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'gzip');
      url += '.gz';
    }

    // response
    if (fs.existsSync(url)) {

      ctx.set('vary', 'User-Agent'); // 

      const stats = fs.lstatSync(url);
      const etag = `${stats.mtimeMs}`; 

      if (ctx.get('if-none-match') === etag) {
        ctx.status = 304; // 响应304
      } else {
        ctx.length = stats.size;
        ctx.set('etag', etag); // 开启服务端资源验证逻辑
        ctx.set('last-modified', stats.mtime); // 开启浏览器端缓存
        // cache control是否启用,似乎作用不大
        //ctx.set('cache-control', `max-age:${opts.maxAge}`);

        ctx.body = fs.createReadStream(url);
      }
    }
  }
}
