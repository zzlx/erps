/**
 * *****************************************************************************
 *
 * cookie middlewares
 *
 * support cookie
 *
 * @file cookies.mjs
 * *****************************************************************************
 */

import util from 'util';
import Keygrip from '../../utils/keygrip.mjs';

const debug = util.debuglog('debug:middleware.cookie');
const COOKIES = Symbol('middleware#cookies');

export default (opts) => function cookieMiddleware (ctx, next) {
  Object.defineProperty(ctx, 'cookies', {
    get: function () {
      if (null == this[COOKIES]) {
        this[COOKIES] = new Cookies(this, { 
          keys: this.app.keys,
          secure: this.secure,
        })
      }

      return  this[COOKIES];
    },
    enumerable: true, // 可枚举属性
    configurable: true, // 可配置属性
  });

  return next();
}

class Cookies {
  constructor (ctx, options) {
    this.ctx = ctx
    this.secure = options && options.secure ? options.secure : false;
    this.keys = options && options.keys
      ? 'string' === typeof options.keys
        ? new Keygrip([options.keys])
        : Array.isArray(options.keys)
          ? new Keygrip(options.keys)
          : options.keys instanceof Keygrip ? options.keys : null
      : null;

    this.cache = {}; // 缓存匹配模式
  }

  /**
   * 获取cookie值,并校验签名 
   */

  get (name, opts) {
    // step_1: 获取cookie项, 若为空，直接返回空值
    let header = this.headers["cookie"];
    if (!header) return;

    // step_2: 模式匹配特定name项cookie的值,匹配不到直接返回空值
    const getPattern = name => this.cache[name] 
      ? this.cache[name]
      : this.cache[name] = new RegExp(
        "(?:^|;) *" +
        name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") +
        "=([^;]*)"
      );
    let match = header.match(getPattern(name));
    if (!match) return; // 未匹配 

    let value = match[1];

    // step_3: 若未配置签名项,直接返回值，不再进行校验
    if (!(opts && opts.signed && !!this.keys)) return value;


    // step_4: 获取签名项
    const sigName = name + ".sig"; // 签名项
    const sigValue = this.get(sigName)
    if (!sigValue) return // 未匹配到签名项目，返回空值

    // step_5: 开始签名验证
    const data = name + "=" + value
    const index = this.keys.index(data, sigValue)

    if (index < 0) {
      // 未验证通过时，重置签名项为控空
      this.set(sigName, null, {path: "/", signed: false })
      return;
    } else {
      // 验证通过时,
      index && this.set(sigName, this.keys.sign(data), { signed: false })
    }

    return value
  }

  /**
   * 设置Cookie项
   */

  set (name, value, opts) {
    // 获取Set-Cookie值
    let headers = this.ctx._headers["set-cookie"] || [];
    if (typeof headers == "string") headers = [headers];

    // cookie项目 
    const cookie = new Cookie(name, value, opts);

    // 配置secure选项
    cookie.secure = opts && opts.secure 
      ? opts.secure
      : this.secure || this.protocol === 'https:';

    // 设置cookie项
    headers.push(cookie.toHeader());

    // 必须显式配置opts.signed为true, 才对cookie项签名
    if (opts && opts.signed) {
      // 设置cookie签名项
      cookie.value = this.keys.sign(cookie.toString());
      cookie.name += ".sig";
      headers.push(cookie.toHeader()); // 添加cookie项签名
    }

    // 设置header
    this.ctx.set('Set-Cookie', headers); 
  }
}


class Cookie{
  constructor (name, value, attrs) {

    /**
     * RegExp to match field-content in RFC 7230 sec 3.2
     *
     * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
     * field-vchar   = VCHAR / obs-text
     * obs-text      = %x80-FF
     */
    // [\t-~_]     
    const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

    /**
     * RegExp to match Same-Site cookie attribute value.
     */

    const sameSiteRegExp = /^(?:lax|strict)$/i


    if (!fieldContentRegExp.test(name)) {
      throw new TypeError('argument name is invalid');
    }

    if (value && !fieldContentRegExp.test(value)) {
      throw new TypeError('argument value is invalid');
    }

    value || (this.expires = new Date(0));

    this.name = name;
    this.value = value || "";

    for (let name in attrs) {
      this[name] = attrs[name]
    }

    if (this.path && !fieldContentRegExp.test(this.path)) {
      throw new TypeError('option path is invalid');
    }

    if (this.domain && !fieldContentRegExp.test(this.domain)) {
      throw new TypeError('option domain is invalid');
    }

    if (this.sameSite && this.sameSite !== true && !sameSiteRegExp.test(this.sameSite)) {
      throw new TypeError('option sameSite is invalid')
    }
  }
}

Cookie.prototype.path = "/";
Cookie.prototype.expires = undefined;
Cookie.prototype.domain = undefined;
Cookie.prototype.httpOnly = true;
Cookie.prototype.sameSite = false;
Cookie.prototype.secure = false;

// 拼接cookie字符串
Cookie.prototype.toString = function () {
  return this.name + "=" + this.value;
}

Cookie.prototype.toHeader = function () {
  let header = this.toString()
  if (this.maxAge) this.expires = new Date(Date.now() + this.maxAge);

  if (this.path     ) header += "; path=" + this.path;
  if (this.expires  ) header += "; expires=" + this.expires.toUTCString();
  if (this.domain   ) header += "; domain=" + this.domain;
  if (this.sameSite ) header += "; samesite=" + (this.sameSite === true ? 'strict' : this.sameSite.toLowerCase());
  if (this.secure   ) header += "; secure";
  if (this.httpOnly ) header += "; httponly";

  return header
}
