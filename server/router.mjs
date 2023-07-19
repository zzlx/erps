/**
 * *****************************************************************************
 * 
 * 服务端路由配置
 *
 * @TODOS:
 *
 * * 解决子路由path问题
 * *
 * * ...
 *
 * *****************************************************************************
 */

import path from "node:path";
import util from "node:util";
import { Router } from "./koa/Router.mjs";
import { cors, ssr, statics } from "./middlewares/index.mjs";
import { paths } from "./settings/paths.mjs"; 

const debug = util.debuglog("debug:server-router");

export const router = new Router({ }); // server router

router.get("Test", "/", (ctx, next) => {
  ctx.body = "首页";
  return next();
});
router.get("Statics", "/*", statics(paths.PUBLIC_HTML, {}));
router.get("Statics", "/statics/es/*", statics(path.join(paths.SERVER, "apps"),{
  index: "index.mjs",
  prefix: "/statics/es",
} ));

// APIs
//router.use("/api", cors(), apis.routes()); // API跨域访问

// Docs
const docsRouter = new Router({ });

docsRouter.get("Docs", "/*", statics(paths.DOCS, { index: "README.md"})); 
// router.use("/docs", docsRouter.routes());

// ssr
const appPath = path.join(paths.SERVER, "apps", "App.mjs");
router.get("UI", ["/", "/*"], ssr({appPath: appPath}));

// Redirect /test to /
// router.redirect("/test", "/");

// User
router.get("user", "/users/:uid", (ctx, next) => {
  debug("params", ctx.params);
  debug("captures", ctx.captures);
  ctx.body = ctx.router.url("user", { id: 180 }, { query: "test=abc"});
  return next();
});
