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
 * @param {string} root, The root directory from which to serve static assets.
 * @param {object} options
 * @return {function} middleware
 *
 * *****************************************************************************
 */ 

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { send } from "../koa/send.mjs";

const debug = util.debuglog("debug:statics");

export function statics (root, options = {}) {
  assert("string" === typeof root, "the root directory is needed to serve files.");
  debug("serve static path:", root);

  const opts = Object.assign({
    root: path.isAbsolute(root) ? root : path.resolve(root),
  }, options);

  fs.promises.stat(opts.root).then(stats => {
    assert(stats.isDirectory(), `${root} is not a valid directory.`);
  }).catch(err => {
    throw new Error(err);
  });

  return async function staticMiddleware (ctx, next) {

    await next(); //

    // 旁路规则:
    // 1. 静态资源仅接受GET、HEAD请求方法
    if (ctx.method !== "GET" && ctx.method !== "HEAD") return;
    // 2. body非空时
    if (ctx.body != null || (ctx.status && ctx.status != 404)) return; 
    // 3. 前缀不匹配时的情况
    //if (ctx.pathname.substr(0, opts.prefix.length) !== opts.prefix) return next();
    // 4. 无后缀不匹配
    //if (path.extname(ctx.pathname) === "") return next();
    
    try {
      await send(ctx, ctx.pathname, opts);
    } catch (err) {
      ctx.throw(err);
    }
  };
}
