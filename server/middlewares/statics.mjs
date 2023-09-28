/**
 * *****************************************************************************
 *
 * Statics:静态资源服务
 *
 * SRS(Static resource service), 用于托管静态文件.
 *
 * ## 功能特性 
 *
 * * 支持内容协商: 静态资源压缩版本选择
 * * 支持服务缓存策略: ETag响应等
 * * 仅支持GET、HEAD两种请求方法
 *
 * @param {string} root, The root directory from which to serve static assets.
 * @param {object} options
 * @return {function} middleware
 *
 * *****************************************************************************
 */ 

import path from "node:path";
import util from "node:util";
import { send } from "../koa/send.mjs";

const debug = util.debuglog("debug:server-statics");

export function statics (dir = "public_html", options = {}) {
  const opts = Object.assign({
    dir: path.resolve(dir),
    prefix: "",
  }, options);

  debug("Statics options: %j", opts);

  return async function staticMiddleware (ctx, next) {
    // 旁路规则:
    // 1. 静态资源仅接受GET、HEAD请求方法
    if (ctx.method !== "GET" && ctx.method !== "HEAD") return;
    // 2. body非空时
    if (ctx.body != null || (ctx.status && ctx.status != 404)) return; 
    // 3. 前缀不匹配时
    if (ctx.pathname.substr(0, opts.prefix.length) !== opts.prefix) return next();
    // 4. 无后缀时
    // if (path.extname(ctx.pathname) === "") return next();
    
    try {
      await send(ctx, ctx.pathname, opts);
    } catch (err) {
      ctx.throw(err);
    }

    await next(); //
  };
}
