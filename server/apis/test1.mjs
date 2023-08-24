/**
 * *****************************************************************************
 * 
 * Backend APIs
 *
 * 服务端路由逻辑
 *
 * API介绍
 *
 * *****************************************************************************
 */

import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { Router } from "../server/kernel/Router.mjs"; 
import { readDir } from "../server/utils/readDir.mjs";

const debug = util.debuglog("debug:apis");
const router = new Router({});

const pwd = (path.dirname(import.meta.url)).substr(7);
const routeFiles = readDir(pwd);
let sitemap = [];

for (const r of routeFiles) {
  const route = r.substr(pwd.length);
  let url = route.substr(0, route.length -4); 
  if (path.basename(url) === "index") continue;
  if (path.basename(url) === "") continue;
  sitemap.push(url);

  const fn = await import(r).then(m => m.default); 
  router.use(url, typeof fn === "function" ? fn : fn.routes());
}

router.get("/", (ctx, next) => {
  const list = sitemap.sort().map(url => 
    `<li><a target="_blank" href="${ctx.pathname}${url}">${url}</a></li>`
  ).join("");

  ctx.body = `<html>
  <h1>API列表</h2>
  <ul>${list}</ul>
</html>`;

  return next();
});

/**
 * 读取文件头介绍
 *
 */

function readNote (file) {
  const c = fs.promises.readFile(file);

  c.then(content => {
      console.log(content.length);
  });
}

function apis (root) {
  return function apisMiddleware (ctx, next) {
    return next();
  }
}

function apiRouter (root) {
  assert(
    "string" === typeof root, 
    "The root paramater for autoRouting  must be a string value.");

  // routing path
  const rPath = path.isAbsolute(root) ? root : path.join(process.cwd(), root);
  const rFiles = readDir(rPath);
  const router = new Router({
    method: ["GET", "POST"],
  });

  for (const f of rFiles) {

    const uri = f.substr(rPath.length);
    let url = uri.substr(0, uri.length - 4);
    if (path.basename(url) === "index") url = path.dirname(url);
    // router.use(url, m);
  }

  const routes = router.routes();
  const allow = router.allowedMethods();

  return function autoRoutingMiddleware (ctx, next) {
    //routes();
    //allow();
    return next();
  }
}

export default router;
