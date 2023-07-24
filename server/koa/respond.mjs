/**
 * *****************************************************************************
 *
 * Respond to the client side.
 *
 * *****************************************************************************
 */

import path from "node:path";
import util from "node:util";
import { HTTP_STATUS_EMPTY_CODES, HTTP_STATUS } from "../constants.mjs";

const debug = util.debuglog("debug:respond");

export function respond (ctx) {
  if (ctx.respond === false) return ctx.stream.end(); // allow bypassing respond
  if (!ctx.state.innerest_middleware) { 
    debug("The innerest middleware was not arrived."); 
  }

  if (!ctx.status || ctx.status == HTTP_STATUS.NOT_FOUND) {
    const allowed = {};

    if (ctx.matched) {
      for (const route of ctx.matched) {
        if (!route.methods) continue;
        for (const method of route.methods) allowed[method] = method;
      }
    }

    const allowedArr = Object.keys(allowed);

    if (ctx.router && ctx.router.methods.indexOf(ctx.method) === -1) {
      ctx.status = HTTP_STATUS.NOT_IMPLEMENTED;
      ctx.set("Allow", ctx.router.methods.join(", "));
    } else if (ctx.method === "OPTIONS") {
      if (allowedArr.length) {
        ctx.status = HTTP_STATUS.OK;  
        ctx.set("Allow", allowedArr.join(", "));
      } else {
        ctx.status = HTTP_STATUS.NOT_IMPLEMENTED;
      }

      ctx.body = "";
    } else if (!allowed[ctx.method]) {
      ctx.status = HTTP_STATUS.METHOD_NOT_ALLOWED;
      ctx.set("Allow", allowedArr.join(", "));
    }
  }

  if (!ctx.status && ctx.body == null) {
    ctx.status = HTTP_STATUS.NOT_FOUND; 
    if (path.extname(ctx.pathname) == "") ctx.body = pageNotFoundTemplate(ctx); 
  }

  // response headers
  if (ctx.headersSent === false) {
    ctx.stream.respond(ctx.response.headers, {
      endStream: HTTP_STATUS_EMPTY_CODES.includes(ctx.status) ? true : false, 
      waitForTrailers: false, 
    });
  }

  // respond contents and end stream
  if ("HEAD" === ctx.method)  return ctx.stream.end(); // head method

  if (ctx.writable === false) return ctx.stream.end(); // can not writable

  if (Buffer.isBuffer(ctx.body)) return ctx.stream.end(ctx.body); // buffer res

  if (typeof ctx.body === "string") return ctx.stream.end(ctx.body); // string

  if (ctx.body && typeof ctx.body.pipe === "function") { // stream
    return ctx.body.pipe(ctx.stream);
  }

  return ctx.stream.end(); // End the respond stream
}

/**
 * Page not found template 
 */

export const pageNotFoundTemplate = ctx => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NOT FOUND</title>
    <link rel="stylesheet" href="/statics/stylesheets/styles.css" />
  </head>
  <body>
    <div class="alert">
      <h4 class="alert-heading">404:Page Not Found</h4>
      <hr>
      <p>您访问的页面: <u><b>${ctx.pathname}</b></u>未被配置或已丢失</p>
      <p>如有必要请通知系统管理员进行解决!</p>
    </div>
  </body>
</html>`;
