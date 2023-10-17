/**
 * *****************************************************************************
 *
 * Applications
 *
 * 基于[KOA](https://koajs.com)实现，集成支持http2、socket通讯等Web2.0技术.
 *
 * 中间件逻辑实现AOP(Aspect Oriented Programming)
 *
 * *****************************************************************************
 */

import assert from 'node:assert';
import EventEmitter from 'node:events'; 
import util from 'node:util';

import { Context } from './Context.mjs';
import { compose } from './compose.mjs';
import { respond } from './respond.mjs';

const debug = util.debuglog('debug:Application');

export class Application extends EventEmitter {
  constructor(opts = {}) {
    super();
    assert(typeof opts === 'object', 'The opts you provided must be an object.');

    this.env = opts.env ? opts.env : "production";
    this.protocol = opts.protocol || 'https';

    // Proxy setting 
    this.proxy = opts.proxy ? true : false;
    this.subdomainOffset = opts.subdomainOffset || 2;
    this.proxyIpHeader = "X-Forwarded-For";
    this.maxIpsCount = 0; // default 0 unlimited 

    this.keys = opts.keys || ['secret1', 'secret2'];
    this.silent = opts.silent;

    this.middlewares = []; // record middlewares be added
  }

  /**
   *
   *
   */

  callback () {
    const fn = compose(this.middlewares);

    // 如果未配置error则配置系统默认的error处理程序
    if (!this.listenerCount('error')) {
      this.on('error', (err, ctx) => { 
        if (err) {
          if (err.status === 404 && error.expose) {
            if (ctx) ctx.body = error;
          } 

        }
      });
    }

    return (stream, headers, flags) => {

      //debug('flags:', flags);
      //debug('headers:', headers);

      let didError = false;

      // finish event
      stream.on('finish', () => {
        //debug('stream finished');
      });

      stream.on('close', () => {
        if (didError) debug('stream未正常关闭!');
      });

      stream.on('error', err => {
        debug(err);
        didError = true;
      });

      stream.on('pipe', e => {
        //debug('stream pipe event:', e);
      });

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

  handleRequest (ctx, fnMiddleware) {
    fnMiddleware(ctx).then(() => respond(ctx)).catch(err => {
      debug(err);
      ctx.onerror(err);
      respond(ctx);
    })
  }

  /**
   * Use the given middleware 'fn'
   *
   * @param {Function} fn
   * @retrun {Application} self
   * @api public
   */

  use (fn) {
    assert(typeof fn === 'function', 'Middleware must be a function!');
    this.middlewares.push(fn);
    return this;
  }
}
