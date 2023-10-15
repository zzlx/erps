/**
 * *****************************************************************************
 * 
 * 服务端路由配置
 *
 * @TODOS:
 *
 * * 解决子路由path问题
 * * ...
 *
 * *****************************************************************************
 */

import path from "node:path";
import util from "node:util";
import { Router } from "../koa/Router.mjs";
import { cors, ssr, statics } from "../middlewares/index.mjs";
import { paths } from "../settings/paths.mjs"; 
import { readdir } from "../utils/readdir.mjs";
import { renderHTML } from "../utils/renderHTML.mjs";

const debug = util.debuglog("debug:server-router");

export const router = new Router({ }); // server router

router.redirect("/home", "/"); // Redirect /test to /

router.get("apps", "/statics/es/*.*", statics("apps", {
  prefix: "/statics/es",
}));

router.get("public_html", "/*", statics("public_html"));

if (process.env.NODE_ENV === "development") {
  router.get("root", "/coding(/*.*)", statics(paths.ROOT, {
    prefix: "/coding",
  }));
}

// APIs
const apis = new Router();
const apiPaths = await readdir(paths.APIS);
const sitemap = [];

apis.get("/", (ctx, next) => {
  const list = sitemap.sort().map(url => 
    `<li class="list-group-item"><a target="_blank" href="${ctx.pathname}${url}">${url}</a></li>`
  ).join("");
  const api = `<h1>API列表</h2><ul class="list-group">${list}</ul>`;

  ctx.body = renderHTML(api);

  return next();
});

for (const r of apiPaths) {
  const route = r.substr(paths.APIS.length);
  let url = route.substr(0, route.length -4); 
  if (path.basename(url) === "index") continue;
  if (path.basename(url) === "") continue;
  sitemap.push(url);

  let hasError = false;

  const fn = await import(r).then(m => m.default).catch(e => {
    debug(e);
    hasError = true;
  }); 

  if (hasError) continue;

  router.use(url, typeof fn === "function" ? fn : fn.routes());
}

router.use("/apis", cors(), apis.routes()); // API跨域访问


// Doc router
const docsRouter = new Router({ });

docsRouter.get("Docs", "*", statics("docs", { 
  index: "README.md",
  prefix: "/docs(/*.*)", // 设置prefix后生效
})); 

router.use("/docs(/*.*)", docsRouter.routes());

// 服务器端渲染
const appPath = path.join(paths.APPS, "App.mjs");
router.all("UI", [ "/homepage", "/homepage/*" ], ssr(appPath));

// User
const testRouter = new Router();

testRouter.get("user", "/users/:uid", (ctx, next) => {
  debug("params", ctx.params);
  debug("captures", ctx.captures);
  ctx.body = ctx.router.url("user", { id: 180 }, { query: "test=abc"});
  return next();
});

router.use(testRouter.routes());

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

function apiRouter (root) {
  if ("string" !== typeof root) {
    throw new Error ("The root paramater for autoRouting  must be a string value.");
  }

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
