/**
 * *****************************************************************************
 *
 * Kernel of services
 *
 * 服务核心程序
 *
 *
 *
 * *****************************************************************************
 */

import assert from 'assert';
import EventEmitter from 'events'; 
import http2 from 'http2';
import util from 'util';
import { inspect } from '../utils.lib.mjs';
import Context from './Context.mjs';
import compose from './compose.mjs';

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
    this.compressThreshold = opts.compressThresshold || 256 * 1024;
    if (opts.keys) this.keys = opts.keys;
    this.silent = opts.silent ? true : false;

    if (this.sessionStore == null) this.sessionStore = new Map(); 

    // 中间件栈
    this.middlewares = [];
    this.tasksBeforeListen = [];

  }

  /**
   *
   *
   */

  async listen () {
    //await Promise.all(this.tasksBeforeListen); // 执行启动前任务

    this.server = http2.createSecureServer({
      allowHTTP1: true,
      key: this.opts.key,
      cert: this.opts.cert,
      //ca: [fs.readFileSync('client-cert.pem')],
      //sigalgs: 
      //ciphers: 
      //clientCertEngine: 
      //dhparam
      //ecdhCurve
      //privateKeyEngine
      passphrase: this.opts.passphrase,
      //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
      sessionTimeout: 300, // seconds
      handshakeTimeout: 120000, // milliseconds
    });

    attachServerEvent.call(this, this.server);
    this.server.on('stream', this.callback());
    this.server.listen(...arguments);
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
      ctx.app = this;
      ctx.headers = headers;
      ctx.flags = flags;
      ctx.stream = stream;

      return this.handleRequest(ctx, fn);
    }
  }

  /**
   * Handle request
   */

  handleRequest (ctx, fn) {
    return fn(ctx).then(() => respond(ctx)).catch(err => {
      if (err.code === 'ENOENT') ctx.status = 404;
      else ctx.status = 500;
      if (ctx.app.env === 'development') ctx.body = err.message;
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
  if (null == ctx.status) ctx.status = 404; // set 404 status
  if (null == ctx.body) ctx.body = ctx.message; // set string message

  // response headers
  ctx.headersSent === false && ctx.stream.respond(ctx.response.headers, {
    endStream: [ 204, 205, 304 ].includes(ctx.status) ? true : false, 
    waitForTrailers: false, 
  });

  // respond contents
  if ('HEAD' === ctx.method)  return ctx.stream.end();
  if (ctx.writable === false) return ctx.stream.end();
  if (Buffer.isBuffer(ctx.body)) return ctx.stream.end(ctx.body);
  if (typeof ctx.body === 'string') return ctx.stream.end(ctx.body);
  if (typeof ctx.body.pipe === 'function') return ctx.body.pipe(ctx.stream);
  return ctx.stream.end(); // respond with no content
}

// attach
function attachServerEvent (server) {

  server.on('keylog', (line, tlsSocket) => {
    debug('keylog event with line:', line.toString());
  });

  server.on('secureConnection', socket => {
    debug('secureConnection event ');
  });

  server.on('newSession', (id, data, cb) => {
    debug('newSession event with sessionId: %s', id.toString('hex'));
    this.sessionStore.set(id.toString('hex'), data);
    cb();
  });

  server.on('OCSPRequest', (certificate, issuer, callback) => {
    debug('OCSPRequest event with certificate: %o, issuer: %o', 
      certificate.toString('hex'),
      issuer,
    );
    callback();
  });

  server.on('resumeSession', (id, cb) => {
    debug('resumeSession event with id: %s', id.toString('hex'));
    cb(null, this.sessionStore.get(id.toString('hex')) || null);
  });

  server.on('sessionError', err => {
    debug('sessionError');
  });

  server.on('unknownProtocol', socket => {
    debug('unknownProtocol');
  });

  server.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${err.port} is used, try again later.`);
    }

    debug(err);
  });

  server.on('close', function () {
    debug(this);
  });

  server.on('listening', function () {
    console.log('The %s Server is running on %o.', process.env.NODE_ENV, this.address());
  });

}

function attachStreamEvents (stream) {

  stream.on('aborted', () => {
    debug('Stream is aborted.');
  });

  stream.on('close', () => {
    debug('Stream is closed.');
  });

  stream.on('error', error => {
    debug('Stream error: ', error);
  });

  stream.on('frameError', (err) => {
    debug('Stream frameError: ', err);
  });

  stream.on('ready', () => {
    debug('Stream is ready.');
  });

  stream.on('timeout', () => {
    debug('Stream is timeout.');
  });

  stream.on('trailers', (headers, flags) => {
    debug(headers);
  });

  stream.on('wantTrailers', () => {
    debug('Stream want trailers.');
  });
}
