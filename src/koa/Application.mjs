/**
 * *****************************************************************************
 *
 * Kernel of services
 *
 * *****************************************************************************
 */

import assert from 'assert';
import cp from 'child_process';
import EventEmitter from 'events'; 
import util from 'util';

import { inspect } from '../utils.lib.mjs';
import Context from './Context.mjs';
import { HTTP_STATUS_EMPTY_CODES } from './constants.mjs';
import compose from './compose.mjs';

export * from './middlewares/index.mjs'; 
export { default as Router } from './router/Router.mjs';

// 调试信息打印工具
const debug = util.debuglog('debug:application.mjs');

export default class Application extends EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;

    // setting properties
    this.env = opts.env || process.env.NODE_ENV || 'production';
    this.protocol = 'http2';
    this.proxy = opts.proxy ? 'true' : false;
    this.subdomainOffset = opts.subdomainOffset || 2;
    if (opts.keys) this.keys = opts.keys;
    this.silent = opts.silent ? true : false;

    // 中间件栈
    this.middlewares = [];
    this.tasksBeforeListen = [];
  }

  /**
   * Listen
   * 开启服务器监听
   */

  listen () {
    assert(this.opts.serverCreator, 'server creator is not avilable.');
    if (this.server == null) this.server = this.opts.serverCreator();
    // 执行完配置任务后再开启服务器监听
    Promise.all(this.tasksBeforeListen.map(task => cp.spawn(task))).then(() => {
      this.server.on('stream', this.callback());
      this.server.listen(...arguments);
    });
  }

  /**
   *
   *
   */

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

  callback () {
    const fn = compose(this.middlewares);

    if (!this.listenerCount('error')) this.on('error', this.onerror); // 绑定事件处理器

    return (stream, headers, flags) => {
      const ctx = new Context();
      ctx.stream = stream;
      ctx.headers = headers;
      ctx.flags = flags;
      ctx.app = this;

      return this.handleRequest(ctx, fn);
    }
  }

  /**
   * Handle request
   */

  handleRequest (ctx, fn) {
    fn(ctx).then(() => respond(ctx)).catch(err => {
      if (err.code === 'ENOENT') ctx.status = 404;
      else ctx.status = 500;
      if (ctx.app.env === 'development') ctx.body = err.stack;
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
  if (ctx.respond === false) return ctx.stream.end(); // allow bypassing respond

  // 设置status为默认值为404
  if (null == ctx.status) ctx.status = 404; // set 404 status

  if (null == ctx.body) {
    ctx.body = ctx.status + ": " + ctx.message; // set string message
  }

  // response headers
  if (ctx.headersSent === false) {
    ctx.stream.respond(ctx.response.headers, {
      endStream: HTTP_STATUS_EMPTY_CODES.includes(ctx.status) ? true : false, 
      waitForTrailers: false, 
    });
  }

  // respond contents
  if ('HEAD' === ctx.method)  return ctx.stream.end();
  if (ctx.writable === false) return ctx.stream.end();
  if (Buffer.isBuffer(ctx.body)) return ctx.stream.end(ctx.body);
  if (typeof ctx.body === 'string') return ctx.stream.end(ctx.body);
  if (typeof ctx.body.pipe === 'function') return ctx.body.pipe(ctx.stream);
  return ctx.stream.end(); // respond with no content
}
