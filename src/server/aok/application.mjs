/**
 * A onion kernel service application.
 *
 * 参考KOA框架,支持sream相应.
 *
 * @file application.mjs
 */

// node modules
import EventEmitter from 'events'; 
import path from 'path';
import util from 'util';

import compose from './compose.mjs';
import Context from './context.mjs';
import respond from './respond.mjs';

export default class Application extends EventEmitter {
  constructor(props) {
    super();
    this.props = props || Object.create(null);
    // 制定配置 -> 环境变量 -> 默认配置
    this.env = this.props.env || process.env.NODE_ENV || 'production';
    this.protocol = this.props.protocol ? props.protocol : 'http2';
    this.proxy = this.props.proxy || false;
    this.subdomainOffset = this.props.subdomainOffset || 2;;
    this.keys = this.props.keys || ['services'];
    // configured middlewares
    this.middlewares = [];

  }

  /**
   * listening
   *
   * @param {Mixed} ...
   * @return {Server}
   * @api public
   */

  listen(...args) {
    if (null == this.server) {
      throw new Error('You need provider a http server for this app.');
    }

    this.server.on('stream', this.callback());
    this.server.on('error', (err) => {
      if (err.errno === 'EADDRINUSE') {
			  console.log('Port %s was be used.', err.port);
        process.exit();
      }
    });

    // listen
    return this.server.listen(...args);
  }

  /**
   * Use the given middleware 'fn'
   *
   * @param {Function} fn
   * @retrun {Application} self
   * @api public
   */

  use (fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('middleware must be a function!');
    }

    this.middlewares.push(fn);
    return this;
  }

  /**
   *
   *
   * @return 
   * @api private
   */

  handleRequest(ctx, fnMiddleware) {
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    // onFinished(ctx.stream, onerror);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  /**
   * Return a handler callback
   * for node's http2 server stream event
   * 
   * @return {Function}
   * @api public
   */

  callback () {
    const fn = compose(this.middlewares);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    const handleRequest = (stream, headers, flags) => {
      const ctx = this.createContext(stream, headers, flags);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }

  /**
   * Initialize a new context
   *
   * @api private
   */

  createContext (stream, headers, flags) {
    // create context and apply fresh property
    const context  = new Context();
    context.stream = stream;
    context.headers = headers;
    context.flags = flags;
    context.app = this;
    context.state = {};

    return context;
  }


  /**
   * Error handler
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
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }
}

Application.prototype.compose = compose;
