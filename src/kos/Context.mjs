/**
 * *****************************************************************************
 * context上下文对象 
 *
 * @file context.mjs
 * *****************************************************************************
 */

import assert from 'assert';
import http from 'http';
import http2 from 'http2';
import net from 'net';
import Stream from 'stream';
import util from 'util';

// @todo: 本地化第三方模块
import accepts from 'accepts';
import contentType from 'content-type';

import HttpError from './HttpError.mjs';
import MemCache from '../utils/memCache.mjs';
import MimeTypes from './MimeTypes.mjs';

const debug = util.debuglog('debug:context.mjs');

// define symbol constants
const ACCEPT = Symbol('context#accept');

const REQ_BODY    = Symbol('context#request-body');
const REQ_HEADERS = Symbol('context#request-headers');
const REQ_URL     = Symbol('context#request-URL');
const REQ_IP      = Symbol('context#request-ip');
const RES_BODY    = Symbol('context#response-body');
const RES_HEADERS = Symbol('context#response-headers');

const EMPTY_CODE = [
	204, // no content
	205, // reset content
	304, // not modified
];

const REDIRECT_CODE = [
	300,  // MULTIPLE_CHOICES 
	301,  // MOVED_PERMANENTLY
	302,  // FOUND
	303,  // SEE_OTHER
	305,  // USE_PROXY
	307,  // TEMPORARY_REDIRECT
	308,  // PERMANENT_REDIRECT
];

// define constants
const mimeTypes = new MimeTypes();
const typeCache = new MemCache(100);

export default class Context {
  /**
   * get request raw body
   */

  get rawBody () {
    if (this[REQ_BODY] != null) return this[REQ_BODY];

    return new Promise(async (resolve, reject) => {
      if (!this.stream.readable) return null;
      this.stream.setEncoding('utf8');
      let data = '';

      for await (const chunk of this.stream) {
        data += chunk;
      }

      this[REQ_BODY] = data;
      resolve(data);
    });
  } 

  /**
   * Request
   *
   */

  get request () {
    return {
      headers: this.headers,
      method: this.method,
      body: this.requestBody,
    }
  }

  /**
   * Response
   */

  get response () {
    return {
      headers: this[RES_HEADERS],
      body: this[RES_BODY],
    }
  }

  /**
   *
   * check field from response header
   *
   * @return {Bool}
   * @api public
   */

  has (field) {
    return Boolean(this[RES_HEADERS][field.toLowerCase()]);
  }


  /**
   * Return httpVersion
   *
   * @api public
   */

  get httpVersion () {
    if (this.stream.closed) {
      return this.app.protocol === 'http2' ? '2' : '1';
    }

    return this.stream.session.alpnProtocol === 'h2' ? '2' : '1';
  }

  /**
   * Return the request socket.
   *
   * @return {Connection}
   * @api public
   */

  get socket() {
    return this.stream.session.socket;
  }


  /**
   * writable
   *
   */
  get writable () {
    return this.stream.writable;
  }

  /**
   * headersSent
   *
   * @api public
   */

  get headersSent() {
    return this.stream.headersSent;
  }

  /**
   * Get response status code.
   *
   * @return {number}
   * @api public
   */

  get status() {
    const statusKey = http2.constants.HTTP2_HEADER_STATUS;
    return this[RES_HEADERS][statusKey];
  }

  /**
   * Set response status code.
   *
   * @param {number|string} code
   * @api public
   */

  set status(code) {
    const sKey = this.httpVersion == 2 
      ? http2.constants.HTTP2_HEADER_STATUS 
      : 'status';
    const sCode = Number.parseInt(code);
    assert(http.STATUS_CODES[sCode], `Settings status ${code} is invalid.`);

    this.set(sKey, sCode);
  }

  /**
   * Get response status message
   *
   * @return {String}
   * @api public
   */

  get message() {
    return http.STATUS_CODES[this.status];
  }

  /**
   * Return request method
   *
   * @return method
   * @api public
   */

  get method() {
    return this.headers[http2.constants.HTTP2_HEADER_METHOD];
  }

  /**
   * Set request method, 
   * useful for implementing middleware such as methodOverride().
   */

  set method(method) {
    this.headers[http2.constants.HTTP2_HEADER_METHOD] = method;
  }

  /**
   *
   */

  get URL() {
    if (!this[REQ_URL]) {
      const schema = this.headers[http2.constants.HTTP2_HEADER_SCHEME];
      const authority = this.headers[http2.constants.HTTP2_HEADER_AUTHORITY];
      const path =  this.headers[http2.constants.HTTP2_HEADER_PATH];

      try {
        this[REQ_URL] = new URL(`${schema}://${authority}${path}`);
      } catch (err) {
        this[REQ_URL] = Object.create(null);
      }
    }

    return this[REQ_URL];
  }

  /**
   * href
   */

  get href() {
    return this.URL.href;
  }

  /**
   * Get origin of URL.
   *
   * @return {String}
   * @api public
   */

  get origin() {
    return this.URL.origin;
  }

  /**
   * protocol
   */

  get protocol() {
    return this.URL.protocol;
  }

  /**
   * username
   */

  get username() {
    return this.URL.username;
  }

  /**
   * password
   */

  get password() {
    return this.URL.password;
  }

  /**
   * host
   *
   * @todo: 完善hostname获取逻辑
   */

  get host() {
    const proxy = this.app.proxy;
    let host = proxy && this.get(http2.constants.HTTP2_HEADER_X_FORWARDED_FOR);
    if (!host) host = this.URL.host;
    if (!host) return '';
    return host.split(/\s*,\s*/, 1)[0];
  }

  /**
   * hostname
   */

  get hostname() {
    return this.URL.hostname;
  }

  /**
   * port
   */

  get port() {
    return this.URL.port;
  }

  /**
   * pathname
   */

  get pathname() {
    return this.URL.pathname;
  }

  /**
   * search
   *
   * strings with?
   *
   */

  get search() {
    return this.URL.search;
  }

  /**
   * searchParams
   *
   * Usage: ctx.searchParams.get('param') => value
   */

  get searchParams() {
    return this.URL.searchParams;
  }

  /**
   * search
   */

  get hash() {
    return this.URL.hash;
  }

  /**
   * Short-hand for:
   *
   *    this.protocol == 'https'
   *
   * @return {Boolean}
   * @api public
   */

  get secure() {
    return 'https:' === this.protocol;
  }

  /**
   * Set Content-Length field to `n`.
   *
   * @param {Number} n
   * @api public
   */

  set length(n) {
    this.set('content-length', Number.parseInt(n));
  }

  /**
   * Return parsed Content-Length when present.
   *
   * @return {Number}
   * @api public
   */

  get length() {
    const len = this[RES_HEADERS][http2.constants.HTTP2_HEADER_CONTENT_LENGTH];
    return ~~len; // ~~'' => 0
  }

  /**
   * When `app.proxy` is `true`, 
   * parse the "X-Forwarded-For" ip address list.
   *
   * For example if the value were "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream.
   *
   * @return {Array}
   * @api public
   */

  get ips() {
    const val = this.headers('X-Forwarded-For');
    return this.app.proxy && val
      ? val.split(/\s*,\s*/)
      : [];
  }

  /**
   * Return request's remote address
   * When `app.proxy` is `true`, 
   * parse the "X-Forwarded-For" ip address list and return the first one
   *
   * @return {String}
   * @api public
   */

  get ip() {
    if (!this[REQ_IP]) {
      this[REQ_IP] = this.socket.remoteAddress || '';
    }
    return this[REQ_IP];
  }

  /**
   * Return subdomains as an array.
   *
   * Subdomains are the dot-separated parts of the host before the main domain
   * of the app. By default, the domain of the app is assumed to be the last two
   * parts of the host. This can be changed by setting `app.subdomainOffset`.
   *
   * For example, if the domain is "tobi.ferrets.example.com":
   * If `app.subdomainOffset` is not set, this.subdomains is
   * `["ferrets", "tobi"]`.
   * If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.
   *
   * @return {Array}
   * @api public
   */

  get subdomains() {
    if (net.isIP(this.hostname)) return [];
    return hostname.split('.').reverse().slice(this.app.subdomainOffset);
  }

  /**
   *
   *
   */

  redirect(url, alt) {
    // location
    if ('back' === url) url = this.ctx.get('Referrer') || alt || '/';
    this.set('Location', encodeURL(url));

    // status
    if (!REDIRECT_CODE[this.status]) this.status = 302;

    // html
    if (this.accepts('html')) {
      //url = escape(url);
      url = url;
      this.type = 'text/html; charset=utf-8';
      this.body = `Redirecting to <a href="${url}">${url}</a>.`;
      return;
    }

    this.type = 'text/plain; charset=utf-8';
  }

  /**
   * Get accept object.
   * Lazily memoized.
   *
   * @return {Object}
   * @api private
   */

  get accept() {
    return this[ACCEPT] || (this[ACCEPT] = accepts(this));
  }

  /**
   * Return the request mime type void of
   * parameters such as "charset".
   *
   * @return {String}
   * @api public
   */

  get type() {
    const type = this[RES_HEADERS][http2.constants.HTTP2_HEADER_CONTENT_TYPE];
    if (!type) return '';
    return type.split(';')[0];
  }

  /**
   * Set Content-Type response header with `type` through `mime.lookup()`
   * when it does not contain a charset.
   *
   * Examples:
   *
   *     this.type = '.html';
   *     this.type = 'html';
   *     this.type = 'json';
   *     this.type = 'application/json';
   *     this.type = 'png';
   *
   * @param {String} type
   * @api public
   */

  set type(type) {
    let mimeType = typeCache.get(type);

    if (!mimeType) {
      mimeType = mimeTypes.contentType(type);
      typeCache.set(type, mimeType);
    }

    if (mimeType) this.set(http2.constants.HTTP2_HEADER_CONTENT_TYPE, mimeType);
    else this.remove(http2.constants.HTTP2_HEADER_CONTENT_TYPE);
  }

  /**
   * Append additional header `field` with value `val`.
   *
   * Examples:
   *
   * ```
   * this.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
   * this.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   * this.append('Warning', '199 Miscellaneous warning');
   * ```
   *
   * @param {String} field
   * @param {String|Array} val
   * @api public
   */

  append(field, val) {
    const prev = this[RES_HEADERS][field];

    if (prev) {
      val = Array.isArray(prev)
        ? prev.concat(val)
        : [prev].concat(val);
    }

    return this.set(field, val);
  }

  /**
   * Remove header `field`.
   *
   * @param {String} name
   * @api public
   */

  remove(field) {
    if (this.headerSent) return;

    if (this[RES_HEADERS][field]) {
      delete this[RES_HEADERS][field];
    }
  }

  /**
   * Return request header.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     this.get('Content-Type');
   *     // => "text/plain"
   *
   *     this.get('content-type');
   *     // => "text/plain"
   *
   *     this.get('Something');
   *     // => ''
   *
   * @param {String} field
   * @return {String}
   * @api public
   */

  get(field) {
    switch (field = field.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return this.headers[http2.constants.HTTP2_HEADER_REFERER] || '';
      default:
        return this.headers[field] || '';
    }
  }


  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `false`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json" or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * Examples:
   *
   *     // Accept: text/html
   *     this.accepts('html');
   *     // => "html"
   *
   *     // Accept: text/*, application/json
   *     this.accepts('html');
   *     // => "html"
   *     this.accepts('text/html');
   *     // => "text/html"
   *     this.accepts('json', 'text');
   *     // => "json"
   *     this.accepts('application/json');
   *     // => "application/json"
   *
   *     // Accept: text/*, application/json
   *     this.accepts('image/png');
   *     this.accepts('png');
   *     // => false
   *
   *     // Accept: text/*;q=.5, application/json
   *     this.accepts(['html', 'json']);
   *     this.accepts('html', 'json');
   *     // => "json"
   *
   * @param {String|Array} type(s)...
   * @return {String|Array|false}
   * @api public
   */

  accepts(...args) {
    return this.accept.types(...args);
  }

  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   *
   * @param {String|Array} encoding(s)...
   * @return {String|Array}
   * @api public
   */

  acceptsEncodings(...args) {
    return this.accept.encodings(...args);
  }

  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   *
   * @param {String|Array} charset(s)...
   * @return {String|Array}
   * @api public
   */

  acceptsCharsets(...args) {
    return this.accept.charsets(...args);
  }

  /**
   * Return accepted language
   *
   * @param {String|Array} language(s)...
   * @return {String|Array}
   * @api public
   */

  acceptsLanguage(...args) {
    return this.accept.language(...args);
  }
  /**
   * Check if the request is fresh, aka
   * Last-Modified and/or the ETag still match.
   *
   * @return {Boolean}
   * @api public
   */

  get fresh () {
    const CACHE_CONTROL_NO_CACHE_REGEXP = /(?:^|,)\s*?no-cache\s*?(?:,|$)/

    const cache_control = this.headers[http2.constants.HTTP2_HEADER_CACHE_CONTROL];
    const modifiedSince = this.headers[http2.constants.HTTP2_HEADER_IF_MODIFIED_SINCE];
    const noneMatch     = this.headers[http2.constants.HTTP2_HEADER_IF_NONE_MATCH];

    const method = this.method;
    const s = this.status;
     // GET or HEAD for weak freshness validation only
    if ('GET' != method && 'HEAD' != method) return false;

    // 2xx or 304 as per rfc2616 14.26
    if ((s >= 200 && s < 300) || 304 == s) {
      if ( !modifiedSince && !noneMatch) return false;
      if (cache_control && CACHE_CONTROL_NO_CACHE_REGEXP.test(cache_control)) {
        return false;
      }

      if (noneMatch && noneMatch !== '*') {
        const etag = this[RES_HEADERS]['etag']
        if (!etag) return false;
      }

      if (modifiedSince) {
        const lastModified = this[RES_HEADERS]['last-modified'];
        const modifiedStale = !lastModified || !(lastModified <= modifiedSince)
        if (modifiedStale) return false
      }

      return true;
    }

    return false;
  }

  /**
   * Get response body.
   *
   * @return {Mixed}
   * @api public
   */

  get body() {
    return this[RES_BODY];
  }

  /**
   * Set response body.
   *
   * If ctx.status has not been set, 
   * will automatically set the status to 200 or 204.
   *
   * @param {String|Buffer|Object|Stream} val
   * @api public
   */

  set body(val) {
    const original = this[RES_BODY];
    this[RES_BODY] = val;

    if (EMPTY_CODE.includes(this.status)) {
      this[RES_BODY] = null;
      return;
    }

    // no content
    if (null == val || val === false || true === val) {
      if (EMPTY_CODE.includes(this.status) === -1) {
        this.status = http2.constants['HTTP_STATUS_NO_CONTENT']; // 204
      }

      this.remove('Content-Type');
      this.remove('Content-Length');
      this.remove('Transfer-Encoding');
      return;
    }

    // set a proper status
    if (this.status == null) this.status = http2.constants['HTTP_STATUS_OK']; // 200

    // set type
    const setType = !this.has('Content-Type');

    // if set string body, 
    // set type and length header
    if ('string' === typeof val) {

      if (setType) {
        this.type = /^\s*<xml/.test(val) 
          ? 'xml' 
          : /^\s*<(:?html)?/.test(val) 
            ? 'html' 
            : 'text';
      }

      this[RES_BODY] = val;
      return;
    }

    // buffer
    if (Buffer.isBuffer(val)) {
      if (setType) this.type = 'bin';
      this.length = val.length;
      return;
    }

    // stream
    if (val && typeof val.pipe === 'function') {
      const handler = error => debug('stream error: ', error);
      if (!~val.listeners('error').indexOf(handler)) val.on('error', handler);
      if (null !== original && original != val) this.remove('Content-Length');
      if (setType) this.type = 'bin';
      return;
    }

    if (typeof val === 'object') {
      this.type = 'json';
      this[RES_BODY] = JSON.stringify(val);
    }

    return;
  }
}

/**
 * Set header `field` to `val`, or pass an object of header fields.
 *
 * Examples:
 *
 *    this.set('Foo', ['bar', 'baz']);
 *    this.set('Accept', 'application/json');
 *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
 *
 * @param {String|Object|Array} field
 * @param {String} val
 * @return {Boolean}
 * @api public
 */

Context.prototype.set = function (field, val) {
  if (this.headerSent) return false; // set header failure
  if (this[RES_HEADERS] == null) this[RES_HEADERS] = Object.create(null);

  if (2 == arguments.length) {
    if (Array.isArray(val)) val = val.map(v => typeof v === 'string' ? v : String(v));
    else if (typeof val !== 'string') val = String(val);
    this[RES_HEADERS][field.toLowerCase()] = val;
  }

  if (typeof field === 'object') {
    for (const key of Object.keys(field)) {
      this.set(key, field[key]);
    }
  }

  return true; // set header success
}

/**
 *
 * ctx.throw([status], [msg], [properties])
 *
 * Throw an error with `status` (default 500) and `msg`. 
 * Note that these are user-level errors, 
 * and the message may be exposed to the client.
 *
 *    this.throw(403)
 *    this.throw(400, 'name required')
 *    this.throw('something exploded')
 *    this.throw(new Error('invalid'))
 *    this.throw(400, new Error('invalid'))
 *
 * See: https://github.com/jshttp/http-errors
 *
 * Note: `status` should only be passed as the first parameter.
 *
 * @param {String|Number|Error} err, msg or status
 * @param {String|Number|Error} [err, msg or status]
 * @param {Object} [properties]
 * @api public
 */

Context.prototype.throw = function (...args) {
  const error = new HttpError(...args);
  throw error;
}
