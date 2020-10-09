/**
 * *****************************************************************************
 *
 * kernel of application services.
 *
 * Usage:
 *
 * const app = new Application();
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
      env: process.env.NODE_ENV || 'production',
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
   *
   *
   */

  handleRequest (ctx, fn) {
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);

    return fn(ctx).then(handleResponse).catch(onerror);
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
 * *****************************************************************************
 *
 * respond 客户端响应程序
 *
 * *****************************************************************************
 */

function respond (ctx) {
  // allow bypassing response
  if (ctx.respond === false) return; 

  // header response
  if (ctx.headersSent === false) { 
    ctx.stream.respond(ctx.response.headers, {
      endStream: [
        // empty content status
        204, 205, 304, 
      ].includes(ctx.status) ? true : false, 
      waitForTrailers: false 
    });
  }

  // content response
  if (ctx.writable === false) {
    return ctx.stream.end();
  }

  if ('HEAD' === ctx.method) {
    return ctx.stream.end();
  }

  if (Buffer.isBuffer(ctx.body) || typeof ctx.body === 'string') {
    return ctx.stream.end(ctx.body);
  }

  if (ctx.body && typeof ctx.body.pipe === 'function') {
    return ctx.body.pipe(ctx.stream);
  }

  return ctx.stream.end();
}
