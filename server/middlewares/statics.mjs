/**
 * *****************************************************************************
 *
 * statics
 *
 * SRS(Static resource service,静态资源服务)
 *
 * 用于托管静态文件
 *
 * ## 功能特性 
 *
 * * 支持内容协商: 静态资源压缩版本选择
 * * 支持服务缓存策略: ETag响应等
 * * 仅支持GET、HEAD两种请求方法
 *
 * *****************************************************************************
 */ 

import assert from "node:assert";
import path from "node:path";
import util from "node:util";
import { send } from "../koa/send.mjs";

const debug = util.debuglog("debug:statics");

/**
 *
 * @param {string} root, The root directory from which to serve static assets.
 * @param {object} options
 * @return {function} middleware
 */

export function statics (root, options = {}) {
  assert(root && "string" === typeof root, "The root directory is not setting.");

  const opts = Object.assign({
    root: path.resolve(root),
    prefix: "",
  }, options);

  debug("serve static path:", root);

  return async function staticMiddleware (ctx, next) {
    // debug("正在尝试访问静态服务:", opts);
    // debug("ctx.state:", ctx.state);

    // 旁路规则:
    // 1. 静态资源仅接受GET、HEAD请求方法
    if (ctx.method !== "GET" && ctx.method !== "HEAD") return;
    // 2. body非空时
    if (ctx.body != null || (ctx.status && ctx.status != 404)) return; 
    // 3. 前缀不匹配时
    if (ctx.pathname.substr(0, opts.prefix.length) !== opts.prefix) return next();
    // 4. 无后配时
    if (path.extname(ctx.pathname) === "") return next();
    
    try {
      await send(ctx, ctx.pathname, opts);
    } catch (err) {
      ctx.throw(err);
    }

    await next(); //
  };
}
