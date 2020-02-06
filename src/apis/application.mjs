/**
 * *****************************************************************************
 * A onion kernel service application.
 *
 * 参考KOA框架,支持sream响应.
 *
 * @file aok.mjs
 * *****************************************************************************
 */

// node modules
import EventEmitter from 'events'; 
import path from 'path';
import util from 'util';
import Stream from 'stream';
import zlib from 'zlib';

import Context from './context.mjs';

const isJSON = (value) => /^[\x20\x09\x0a\x0d]*(\[|\{)/.test(String(value));
const debug = util.debuglog('debug:aok');

export default class Aok extends EventEmitter {
  constructor(props) {
    super();
    this.props = props || Object.create(null);
    this.env = this.props.env || process.env.NODE_ENV || 'production';
    this.protocol = this.props.protocol ? props.protocol : 'http2';
    this.proxy = this.props.proxy || false;
    this.subdomainOffset = this.props.subdomainOffset || 2;;
    this.keys = this.props.keys || ['services'];
    this.middlewares = []; // configured middlewares
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
   * Return a handler callback for node's http2 server stream event
   * 
   * @return {Function}
   * @api public
   */

  streamHandler () {
    const fn = this.compose(this.middlewares);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    return (stream, headers, flags) => {

      const ctx = new Context();
      ctx.stream = stream;
      ctx.headers = headers;
      ctx.flags = flags;
      ctx.app = this;
      ctx.state = {};

      const onerror = err => ctx.onerror(err);
      const handleResponse = () => this.respond(ctx);
      // onFinished(ctx.stream, onerror);
      return fn(ctx).then(handleResponse).catch(onerror);
    }
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
}
