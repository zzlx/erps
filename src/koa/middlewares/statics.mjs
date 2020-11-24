/**
 * *****************************************************************************
 *
 * SRS Middleware
 * ==============
 *
 * 静态资源服务(Static resource service,SRS), 提供托管静态资源服务功能.
 *
 * ## 功能特性 
 *
 * * 支持内容协商: 静态资源压缩版本选择
 * * 支持服务缓存策略: ETag响应等
 * * 仅支持GET、HEAD两种请求方法
 *
 * @param {string} root, The root directory from which to serve static assets.
 * @param {object} options
 *
 * *****************************************************************************
 */ 

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { HTTP_STATUS } from '../constants.mjs';

export default function statics (root, options = {}) {
  assert('string' === typeof root, 'The root directory must be setting.');

  const opts = Object.assign({
    dotfiles: 'ignore',
    etag: true,
    directoryIndex: [ 'index.html' ],
    extensions: [ 'html' ],
    index: false,
    immutable: false,
    maxAge: 3600, // 默认缓存1小时(3600s)
    prefix: '/',
    redirect: true, // 默认会重定向到索引文件
  }, options);

  if ('string' === typeof opts.directoryIndex) {
    opts.directoryIndex = opts.directoryIndex.split(',');
  }

  if (!Array.isArray(opts.directoryIndex)) opts.directoryIndex = false;

  return function staticsMiddleware (ctx, next) {

    // 旁路规则:
    if (!/GET|HEAD/.test(ctx.method)) return next(); // 1. 非GET、HEAD请求方法时
    if (ctx.body != null) return next(); // 2. body已被设置时
    // 旁路前缀不匹配时的情况
    if (ctx.pathname.substr(0, opts.prefix.length) !== opts.prefix) return next();

    // Response static resource:
    const relativePath = path.relative(opts.prefix, ctx.pathname);
    const absolutePath = path.resolve(root, relativePath);
    let url = absolutePath;

    if (path.extname(url) === '' && fs.existsSync(url)) {
      // 匹配目录索引文件
      for (const index of opts.directoryIndex) {
        const indexPath = path.join(url, index);
        if (fs.existsSync(indexPath)) { 
          url = indexPath; 
          // 重定向
          if (opts.redirect) {
            const location = path.join(opts.prefix, path.relative(root, url));
            ctx.set('location', location);
            ctx.status = HTTP_STATUS.TEMPORARY_REDIRECT; // 307
            return next();
          } else {
            break;
          }
        }
      }
    }

    // 未匹配到目录索引文件时不再响应
    if (path.extname(url) === '') return next(); 
    if (!fs.existsSync(url)) return next(); // 文件不存在时,不再响应

    ctx.type = path.extname(url);

    // 内容协商算法:
    // Vary 是一个HTTP响应头部信息，
    // 它决定了对于未来的一个请求头，
    // 应该用一个缓存的回复(response)还是向源服务器请求一个新的回复。
    // 在响应状态码为 304 Not Modified  的响应中，
    // 也要设置 Vary 首部，而且要与相应的 200 OK 响应设置得一模一样。
    //ctx.set('vary', 'accept-encoding');
    ctx.set('vary', 'User-Agent');

    // 支持静态资源压缩版本
    const accetpEncoding = ctx.get('accept-encoding');

    if (/deflate/.test(accetpEncoding) && fs.existsSync(url + '.deflate')) {
      ctx.set('content-encoding', 'deflate');
      url += '.deflate';
    } else if (/\bgzip\b/.test(accetpEncoding) && fs.existsSync(url + '.gz')) {
      ctx.set('content-encoding', 'gzip');
      url += '.gz';
    } else if (/br/.test(accetpEncoding) && fs.existsSync(url + '.br')) {
      ctx.set('content-encoding', 'br');
      url += '.br';
    } 

    const stats = fs.lstatSync(url);
    const ETag = etag(stats); 

    if (ctx.get('if-none-match') === ETag) {
      ctx.status = HTTP_STATUS.NOT_MODIFIED; // 304
      return next();
    }

    // 客户端缓存配置
    opts.etag && ctx.set('etag', ETag);
    ctx.set({
      //'last-modified': stats.mtime, // 开启浏览器端缓存
      //'cache-control': `max-age=${ctx.app.env === 'development' ? 0 : opts.maxAge}`,
    }); 

    ctx.length = stats.size;
    ctx.body = fs.createReadStream(url, { emitClose: true, autoClose: true,});

    return next();
  }
}

/**
 * Generate a tag for a stat.
 *
 * @param {object} stat
 * @return {string}
 * @private
 */

function statTag (stat) {
  const mtime = stat.mtime.getTime().toString(16);
  const size = stat.size.toString(16);

  return '"' + size + '-' + mtime + '"';
}
/**
 * Determine if object is a Stats object.
 *
 * @param {object} obj
 * @return {boolean}
 * @api private
 */

function isstats (obj) {
  // genuine fs.Stats
  if (typeof Stats === 'function' && obj instanceof Stats) {
    return true
  }

  // quack quack
  return obj && typeof obj === 'object' &&
    'ctime' in obj && toString.call(obj.ctime) === '[object Date]' &&
    'mtime' in obj && toString.call(obj.mtime) === '[object Date]' &&
    'ino' in obj && typeof obj.ino === 'number' &&
    'size' in obj && typeof obj.size === 'number'
}

/**
 * Generate an entity tag.
 *
 * @param {Buffer|string} entity
 * @return {string}
 * @private
 */

function entitytag (entity) {
  if (entity.length === 0) {
    // fast-path empty
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'
  }

  // compute hash of entity
  var hash = crypto
    .createHash('sha1')
    .update(entity, 'utf8')
    .digest('base64')
    .substring(0, 27)

  // compute length of entity
  var len = typeof entity === 'string'
    ? Buffer.byteLength(entity, 'utf8')
    : entity.length

  return '"' + len.toString(16) + '-' + hash + '"'
}

/**
 * Create a simple ETag.
 *
 * @param {string|Buffer|Stats} entity
 * @param {object} [options]
 * @param {boolean} [options.weak]
 * @return {String}
 * @public
 */

function etag (entity, options) {
  if (entity == null) {
    throw new TypeError('argument entity is required')
  }

  // support fs.Stats object
  const isStats = isstats(entity);
  const weak = options && typeof options.weak === 'boolean'
    ? options.weak
    : isStats;

  // validate argument
  if (!isStats && typeof entity !== 'string' && !Buffer.isBuffer(entity)) {
    throw new TypeError('argument entity must be string, Buffer, or fs.Stats')
  }

  // generate entity tag
  const tag = isStats ? statTag(entity) : entitytag(entity);

  return weak ? 'W/' + tag : tag
}
