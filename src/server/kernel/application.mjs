/**
 * *****************************************************************************
 *
 * A onion kernel service application.
 *
 * @file application.mjs
 * *****************************************************************************
 */

// node modules
import EventEmitter from 'events'; 
import cp from 'child_process';
import path from 'path';
import util from 'util';

// modules
import compose from './compose.mjs';
import Context from './context.mjs';
import respond from './respond.mjs';

const debug = util.debuglog('debug:application'); // debug function

export default class Application extends EventEmitter {
  constructor(props) {
    super();
    this.props = props ? props : Object.create(null);
    this.env = this.props.env || process.env.NODE_ENV || 'production';
    this.protocol = this.props.protocol ? this.props.protocol : 'http2';
    this.proxy = this.props.proxy ? this.props.proxy : false;
    this.subdomainOffset = this.props.subdomainOffset ? this.props.subdomainOffset : 2;
    this.keys = this.props.keys ? this.props.keys : ['services'];
    this.middlewares = []; // configured middlewares

    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
  }

  /**
   * inspect
   *
   */

  inspect () {

  }

  /**
   * Use the given middleware 'fn'
   *
   * @param {Function} fn
   * @retrun {Application} self
   * @api public
   */

  use (fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');

		debug('use %s', fn._name || fn.name || 'anonymous function');
    this.middlewares.push(fn);
    return this;
  }

  /**
   *
   */

  callback () {
    const fn = this.compose(this.middlewares);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    return (stream, headers, flags) => {
			// 创建context对象
      const ctx = new Context();
      ctx.stream = stream;
      ctx.headers = headers;
      ctx.flags = flags;
      ctx.app = this;
      ctx.state = {};

      return this.handleRequest(ctx, fn);
    };
  }

  /**
   * Return a handler callback for node's http2 server stream event
   * 
   * @return {Function}
   * @api public
   */

  handleRequest (ctx, fn) {
		return fn(ctx).then(() => respond(ctx)).catch(err => respond(ctx, err));
  }

  /**
   * listen
   */

  listen (...args) {
    if (null == this.server) {
      throw new Error('Please setup server to application.');
      return;
    }

		this.server.on('stream', this.callback());
		this.server.listen(...args); // 开启服务
  }


  /**
	 * app-level error handler
   *
   * @param {Error} err
   * @api private
   */

  onerror(err) {
    if (!(err instanceof Error)) {
      throw new TypeError(util.format('non-error thrown: %j', err));
    }

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    debug(msg.replace(/^/gm, '  '));
  }

}

Application.prototype.compose = compose;
