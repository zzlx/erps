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
import path from 'path';
import cp from 'child_process';
import util from 'util';

// modules
import compose from '../middlewares/compose.mjs';
import Context from './context.mjs';
import respond from './respond.mjs';
import setupServer from '../http2s.mjs';

const debug = util.debuglog('debug:application'); // debug function

export default class Application extends EventEmitter {
  constructor(props) {
    super();
    this.props = props ? props : Object.create(null);
    this.env = props.env || process.env.NODE_ENV || 'production';
    this.protocol = props.protocol ? props.protocol : 'http2';
    this.proxy = props.proxy ? props.proxy : false;
    this.subdomainOffset = props.subdomainOffset ? props.subdomainOffset : 2;
    this.keys = props.keys ? props.keys : ['services'];
    this.middlewares = []; // configured middlewares

    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
  }

  /**
   *
   *
   */

  listen (...args) {
		this.server.on('stream', this.callback());
		this.server.listen(...args); // 开启服务
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
    const fn = compose(this.middlewares);

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
		const onError = err => ctx.onerror(err);
		const responseHandler = () => respond(ctx);
		return fn(ctx).then(responseHandler).catch(onError);
  }

  /**
	 * app-level error handler
   *
   * @param {Error} err
   * @api private
   */

  onerror(err) {
    if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    debug(msg.replace(/^/gm, '  '));
  }

	set server (server) {
		if ( null == this._server) this._server = server;
	}

  get server () {
    if (null == this._server) {
      this._server = setupServer({
        cert: this.props.cert,
        key: this.props.key,
      });
    }

    return this._server;
  }
}
