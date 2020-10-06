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

import Router from './Router.mjs';
import Context from './Context.mjs';
import compose from './compose.mjs';
import respond from './respond.mjs';

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
