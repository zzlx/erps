/**
 * *****************************************************************************
 *
 * Kernel of services
 *
 * 服务核心程序
 *
 *
 * *****************************************************************************
 */

import assert from 'assert';
import EventEmitter from 'events'; 
import util from 'util';
import Context from './Context.mjs';
import compose from './compose.mjs';
const debug = util.debuglog('debug:application.mjs');

export default class Application extends EventEmitter {
  constructor(opts) {
    super();

    this.opts = Object.assign({}, { 
      // default options
      env: 'production',
      keys: ['enpseC5vcmc='],
      protocol: 'http2',
      proxy: false,
      silent: false,
      compressThreshold: 128, // unit kb,超出此阈值后启用压缩
      subdomainOffset: 2, // xxxx.xx
    }, opts);

    this.env = this.opts.env;
    this.protocol = this.opts.protocol ? 'http2' : 'http2';
    this.proxy = this.opts.proxy ? 'true' : false;
    this.subdomainOffset = this.opts.subdomainOffset || 2;
    this.keys = this.opts.keys || ['services'];

    // 中间件栈存储器
    this.middlewares = [];

  } // end of constructor

  /**
   * Use the given middleware 'fn'
   *
   * @param {Function} fn
   * @retrun {Application} self
   * @api public
   */

  use (fn) {
    assert(typeof fn === 'function', 'The middleware must be a function!');

    this.middlewares.push(fn);
    return this;
  }

  /**
   *
   */

  streamHandler () {
    const fn = compose(this.middlewares);

    if (!this.listenerCount('error')) this.on('error', this.onerror); // 绑定事件处理器

    return (stream, headers, flags) => {
      const ctx = new Context();
      ctx.app = this;
      ctx.headers = headers;
      ctx.flags = flags;
      ctx.stream = stream;
      ctx.errors = []; // 错误存储器
      ctx.state = Object.create(null); // 存储器

      return this.handleRequest(ctx, fn);
    }
  }

  /**
   * 处理请求
   */

  handleRequest (ctx, fn) {
    return fn(ctx).then(() => respond(ctx)).catch(err => {
      // 处理捕获到的中间件返回的错误
      if (err.code === 'ENOENT') {
        ctx.status = 404;
        ctx.body = err.message
      } else {
        ctx.status = 500;
        ctx.body = err.message
      }

      respond(ctx);
    });
  }

  /**
	 * app-level error handler
   *
   * @param {Error} err
   * @api private
   */

  onerror(err, ctx) {
    assert(err instanceof Error, util.format('non-error thrown: %j', err));

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    debug(msg.replace(/^/gm, '  '));
  }
}

/**
 * 服务器端响应程序
 */

function respond (ctx) {
  // allow bypassing response
  if (ctx.respond === false) return ctx.stream.end();

  // ensure status is exists
  ctx.status = ctx.status || 404;
  if (null == ctx.body) ctx.body = ctx.message;

  // response headers, if headers has not been send
  ctx.headersSent === false && ctx.stream.respond(ctx.response.headers, {
    endStream: [ 204, 205, 304 ].includes(ctx.status) ? true : false, 
    waitForTrailers: false, 
  });

  // response content
  //
  // writable
  if (ctx.writable === false) return ctx.stream.end();

  if ('HEAD' === ctx.method)  return ctx.stream.end();

  // buffer/string
  if (Buffer.isBuffer(ctx.body) || typeof ctx.body === 'string') {
    return ctx.stream.end(ctx.body);
  }

  // stream
  if (ctx.body && typeof ctx.body.pipe === 'function') {
    return ctx.body.pipe(ctx.stream);
  }

  // json
  if (typeof ctx.body === 'object') {
    ctx.type = 'json';
    ctx.body = JSON.stringify(ctx.body);
    return ctx.stream.end(ctx.body);
  }

  return ctx.stream.end();
}
