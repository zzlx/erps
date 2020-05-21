/**
 * *****************************************************************************
 *
 * A onion kernel service application.
 *
 * 参考KOA框架,支持sream响应.
 *
 * @file application.mjs
 * *****************************************************************************
 */

// node modules
import EventEmitter from 'events'; 
import http from 'http';
import https from 'https';
import http2 from 'http2';
import path from 'path';
import Stream from 'stream';
import cp from 'child_process';
import util from 'util';
import zlib from 'zlib';

// modules
import Context from './context.mjs';
import setupServer from './http2Server.mjs';

const debug = util.debuglog('debug:application'); // debug function

export default class Application extends EventEmitter {
  constructor(props) {
    super();
    this.props = props ? props : Object.create(null);

    // 属性配置
    this.env = props.env || process.env.NODE_ENV || 'production'; // 默认产品模式
    this.protocol = props.protocol ? props.protocol : 'http2'; // 默认http2协议
    this.proxy = props.proxy ? props.proxy : false;
    this.subdomainOffset = props.subdomainOffset ? props.subdomainOffset : 2;
    this.keys = props.keys ? props.keys : ['services'];
    this.middlewares = []; // configured middlewares
    this.context = Object.create(null);
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
    if (typeof fn !== 'function') {
      throw new TypeError('middleware must be a function!');
    }

    this.middlewares.push(fn);

    return this;
  }

  /**
   *
   */

  callback () {
    const fn = this.compose(this.middlewares);

    // 绑定app级别error事件处理
    if (!this.listenerCount('error')) this.on('error', this.onerror);

    return (stream, headers, flags) => {
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
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => this.respond(ctx);
    // onFinished(ctx.stream, onerror);
    return fn(ctx).then(handleResponse).catch(onerror);
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

    // 调试信息
    debug(msg.replace(/^/gm, '  '));
  }

  /**
   *
   *
   */

  respond (ctx) {
    // Indicate the version of server environment.
    if ('development' === ctx.app.env) {
      ctx.set('X-Powered-By', `Node@${process.version}`);
    }

    // allow bypassing.
    if (false === ctx.respond) return; 

    if (!ctx.writable) return;

    let body = ctx.body;
    const code = ctx.status;

    // ignore body
    // 204: no content
    // 205: reset content
    // 304: not modified
    const emptyCode = [204, 205, 304];
    if (emptyCode.includes(code)) {
      ctx.body = null;
      return ctx.stream.end();
    }

    if ('HEAD' == ctx.method || 'OPTIONS' == ctx.method) {
      if (!ctx.headersSent && !ctx.has('Content-Length')) {
        //ctx.length 
      }

      ctx.stream.respond(ctx._headers);
      return ctx.stream.end();
    }

    // status body
    if (null == body) {
      ctx.status = 404;
      if (ctx.httpVersion >= 2) {
        body = ctx.message;
      } else {
        body = ctx.message || String(code);
      }

      if (!ctx.headersSent) {
        ctx.type = 'text';
        ctx.length = Buffer.byteLength(body);
        ctx.stream.respond(ctx._headers);
      }

      if (ctx.writable) {
        return ctx.stream.end(body);
      } else {
        return ctx.stream.end();
      }
    }

    // responses
    if (Buffer.isBuffer(body) || 'string' == typeof body) {
      ctx.stream.respond(ctx._headers);
      return ctx.stream.end(body);
    }

    if (body instanceof Stream) {
      ctx.stream.respond(ctx._headers);
      return body.pipe(ctx.stream);
    }

    // Assume body is a json value
    body = JSON.stringify(body);

    if (!ctx.headersSent) {
      ctx.length = Buffer.byteLength(body);

      // only compress filesize gretter than 100kb
      if (ctx.length > 1024 * 100) {
        if (/\bbr\b/.test(ctx.get('accept-encoding'))) {
          ctx.set('content-encoding', 'br');
          ctx.set('vary', 'accept-encoding');
          body = zlib.brotliCompressSync(body);
          ctx.length = Buffer.byteLength(body);
        } else if (/\bdefate\b/.test(ctx.get('accept-encoding'))) {
          ctx.set('content-encoding', 'deflate');
          ctx.set('vary', 'accept-encoding');
          body = zlib.deflateSync(body);
          ctx.length = Buffer.byteLength(body);
        } else if (/\bgzip\b/.test(ctx.get('accept-encoding'))) {
          ctx.set('content-encoding', 'gzip');
          ctx.set('vary', 'accept-encoding');
          body = zlib.gzipSync(body);
          ctx.length = Buffer.byteLength(body);
        }
      }
    }

    ctx.stream.respond(ctx._headers);
    ctx.stream.end(body);
  }

  /**
   * Compose `middleware` returning a fully valid middleware.
   *
   * @param {Array} middleware
   * @return {Function}
   */

  compose (middleware) {
    if (!Array.isArray(middleware)) {
      throw new TypeError('Middleware must be an array!');
    }

    return function composedMiddleware (context, next) {
      let index = -1;
      return dispatch(0);

      function dispatch (i) {

        if (i <= index) {
          return Promise.reject(new Error('next() called multiple times'));
        }

        index = i;
        let fn = (i === middleware.length) ? next : middleware[i];
        if (!fn) return Promise.resolve();

        try {
          return Promise.resolve(fn(context, dispatch.bind(null, ++i)));
        } catch (err) {
          return Promise.reject(err);
        }
      }
    }
  }

  get server () {
    if (null == this._server) {
      this._server = http2.createSecureServer({
        //ca: [fs.readFileSync('client-cert.pem')],
        cert: this.props.cert,
        //sigalgs: 
        //ciphers: 
        //clientCertEngine: 
        //dhparam
        //ecdhCurve
        key: this.props.key,
        //privateKeyEngine
        //passphrase: 'sample',
        //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
        allowHTTP1: true,
        // This is necessary only if using client certificate authentication.
        //requestCert: true,
        //enableConnectProtocol: true
      });

			// 配置server监听事件
			//setupServer(this._server);
    }

    return this._server;
  }
}
