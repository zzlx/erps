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

import Context from './Context.mjs';
import compose from './compose.mjs';
import respond from './respond.mjs';
import { HTTP_STATUS_EMPTY_CODES } from './constants.mjs';

export default class Application extends EventEmitter {
  constructor(opts) {
    super();

    // setting properties
    this.env = opts.env || process.env.NODE_ENV || 'production';
    this.protocol = 'http2';
    this.proxy = opts.proxy ? 'true' : false;
    this.subdomainOffset = opts.subdomainOffset || 2;
    if (opts.keys) this.keys = opts.keys;
    this.silent = opts.silent ? true : false;
    this.serverCreator = opts.serverCreator || null;

    // app storage
    this.middlewares = []; // store middlewares
    this.tasksBeforeListen = []; // store tasks
    this.queueList = [];

  }

  /**
   * 开启服务器监听
   */

  listen () {
    assert(this.serverCreator, 'server creator is not avilable.');

    if (this.server == null) this.server = this.serverCreator();
    // 执行完配置任务后再开启服务器监听
    Promise.all(this.tasksBeforeListen.map(task => cp.spawn(task))).then(() => {
      this.server.on('stream', this.callback());
      this.server.listen(...arguments);
    });
  }

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
    console.error(msg.replace(/^/gm, '  '));
  }
}
