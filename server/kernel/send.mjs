/**
 * *****************************************************************************
 *
 * Send
 *
 * *****************************************************************************
 */ 

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { HTTP_STATUS } from "../constants.mjs";
import { etag, stripLeadingSlash, stripTrailingSlash } from "../utils/index.mjs";

const debug = util.debuglog("debug:send-middleware");

export async function send (ctx, pathname, options = {}) {
  assert(ctx, "context is required by send middleware."); 
  assert(pathname, "pathname is required by send middleware.");

  const opts = Object.assign({}, {
    index: false, 
    maxage: 0,
    hidden: false,
    immutable: false,
    format: false,
    extensions: false,
  }, options);

  const root = opts.dir ? path.normalize(path.resolve(opts.dir)) : "";

  const prefix = path.join(
    ctx.router && ctx.router.opts.prefix ? ctx.router.opts.prefix : "",  
    opts.prefix ? opts.prefix : "",
  );

  // debug("prefix:", prefix);

  const pathName = prefix && ctx.pathname.substr(0, prefix.length) === prefix
    ? ctx.pathname.length === prefix.length ? "/" : ctx.pathname.slice(prefix.length)
    : ctx.pathname;

  if (typeof opts.index === "string") opts.index = String.prototype.split.call(opts.index, ",");

  let hasQueryString = false;
  let i = 0;

  for (const c of pathName) {
    if (c === "?") {
      hasQueryString = true;
      break;
    }
    i++;
  }

  // get uri from pathname
  let uri = i == 0 
    ? stripTrailingSlash(stripLeadingSlash(pathName))
    : stripTrailingSlash(stripLeadingSlash(pathName.substr(0, i)));

  try {
    // 去掉查询字符串
    uri = decodeURIComponent(uri);
  } catch (err) {
    return ctx.throw(HTTP_STATUS.BAD_REQUEST, `${pathName} failed to decode.`);
  }

  // 
  uri = path.join(root, uri);

  if (!exists(uri)) return;
  if (!opts.hidden && isHidden(uri)) return; // hiddenfile support or not

  let encodingExt = "";

  // const encodings = ctx.get("accept-encoding").split(/\b,\s?/);

  if (ctx.acceptsEncodings("br", "identity") === "br" && exists(uri + ".br")) {
    uri += ".br";
    ctx.set("Content-Encoding", "br");
    ctx.remove("Content-Length");
    encodingExt = ".br";
  } else if (ctx.acceptsEncodings("gzip", "identity") === "gzip" && exists(uri + ".gz")) {
    uri += ".gz";
    ctx.set("Content-Encoding", "gzip");
    ctx.remove("Content-Length");
    encodingExt = ".gz";
  } else if (ctx.acceptsEncodings("deflate", "identity") === "deflate" && exists(uri + ".deflate")) {
    uri += ".deflate";
    ctx.set("Content-Encoding", "deflate");
    ctx.remove("Content-Length");
    encodingExt = ".deflate";
  }

  let stats = await fs.promises.stat(uri);

  if (stats.isDirectory()) {
    if (!opts.index) return;

    let matched;

    for (const index of opts.index) {
      if (exists(path.join(uri, index))) {
        uri = path.join(uri, index);
        stats = await fs.promises.stat(uri);
        matched = true;
        break;
      }
    }

    if (!matched) return;
  }

  if (!ctx.get("Last-Modified")) ctx.set("Last-Modified", stats.mtime.toUTCString());
  if (!ctx.get("Cache-Control")) {
    const directives = [`max-age=${(opts.maxage / 1000 | 0)}`];
    if (opts.immutable) {
      directives.push("immutable");
    }
    ctx.set("Cache-Control", directives.join(","));
  }

  // 内容协商算法:
  // Vary 是一个HTTP响应头部信息，
  // 它决定了对于未来的一个请求头，
  // 应该用一个缓存的回复(response)还是向源服务器请求一个新的回复。
  // 在响应状态码为 304 Not Modified  的响应中，
  // 也要设置 Vary 首部，而且要与相应的 200 OK 响应设置得一模一样。
  ctx.set("vary", "User-Agent");

  const ETag = etag(stats); 

  if (ctx.get("if-none-match") === ETag) { 
    ctx.status = 304; 
    return; 
  }

  ctx.set("Content-Length", stats.size);
  ctx.set("etag", ETag);

  if (!ctx.type) {
    ctx.type = encodingExt === "" 
      ? path.extname(uri) 
      : path.extname(path.basename(uri, encodingExt));
  }

  ctx.body = fs.createReadStream(uri, { emitClose: true, autoClose: true});

  return;
}

/**
 * Check if exits
 */

function exists (path) {
  try {
    fs.accessSync(path, fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }

  //const R_OK = fs.constants.R_OK;
  //return fs.promises.access(path, R_OK).then(() => true).catch(err => false);
}

/**
 * Check if it"s hidden.
 */

function isHidden (uri) {
  const paths = uri.split(path.sep);

  for (const path of paths) {
    if (path[0] === ".") return true;
  }

  return false;
}
