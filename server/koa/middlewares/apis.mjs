/**
 * *****************************************************************************
 *
 * apis
 *
 * 配置api目录
 *
 *
 * *****************************************************************************
 */ 

import assert from "node:assert";
import util from "node:util";
import { readdir } form "../../utils/readdir.mjs";

const debug = util.debuglog("debug:kernel-apis");

export function apis (_root) {
  assert(_root != null, "_root must be set for apis.");

  // read _root
  // fs.promise.readdir(_root, { withFileTypes: true }).then().catch(err => { });

  return function apisMiddleware (ctx, next) {
    // await next(); // 
    if (String.prototype.substr.apply(ctx.pathname, [0,5]) !== "/api/") return;

    if (ctx.method === "GET") {
      ctx.body = "API";
    }

    return next();
  };
}
