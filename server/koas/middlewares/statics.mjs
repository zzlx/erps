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

const debug = util.debuglog('debug:statics-middleware');

export default (options = {}) => {
  const opts = Object.assign({}, {
    compress: false,
    directoryIndex: ['index.html'],
    immutable: false,
    index: 'index.html',
    maxAge: 1*60*60, // 默认缓存1小时
    root: null,
    lastModified: true,
    rewrite: true, // 重定向
  }, typeof options === 'string' ? { root: options } : options);

  if (opts.root == null) {
    throw new Error('You must provider the static path as the root path.');
  }

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

    ctx.type = path.extname(url); // set content-type

    // #内容协商算法#
    // content negotiation algorithm
    //

    // Vary 是一个HTTP响应头部信息，
    // 它决定了对于未来的一个请求头，应该用一个缓存的回复(response)还是向源服务器请求一个新的回复。
    // 在响应状态码为 304 Not Modified  的响应中，也要设置 Vary 首部，而且要与相应的 200 OK 响应设置得一模一样。
    //ctx.set('vary', 'accept-encoding');
    ctx.set('vary', 'User-Agent');

    // 
    const accetpEncoding = ctx.get('accept-encoding'); // get accept encoding
    if (/\bbr\b/.test(accetpEncoding) && fs.existsSync(url + '.br')) {
      ctx.set('content-encoding', 'br');
      url += '.br';
    } else if (/\bdeflate\b/.test(accetpEncoding) && fs.existsSync(url + '.deflate')) {
      ctx.set('content-encoding', 'deflate');
      url += '.deflate';
    } else if (/\bgzip\b/.test(accetpEncoding) && fs.existsSync(url + '.gz')) {
      ctx.set('content-encoding', 'gzip');
      url += '.gz';
    }

    // response
    if (fs.existsSync(url)) {
      const stats = fs.lstatSync(url);
      const etag = `${stats.mtimeMs}`; 

      if (ctx.get('if-none-match') === etag) {
        return ctx.status = 304; // not modified status
      }

      ctx.length = stats.size;
      ctx.set('etag', etag); // 开启服务端资源验证逻辑
      ctx.set('last-modified', stats.mtime); // 开启浏览器端缓存

      ctx.set('cache-control', `max-age=${opts.maxAge}`); 
      if (ctx.app.env === 'development') ctx.set('cache-control', 'max-age=0'); 

      ctx.body = fs.createReadStream(url);
    }
  }
}
