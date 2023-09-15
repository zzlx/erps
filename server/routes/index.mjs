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
import { Router } from "../kernel/Router.mjs";
import { ssr, statics } from "../kernel/middlewares/index.mjs";
import { paths } from "../settings/paths.mjs"; 

const debug = util.debuglog("debug:server-router");

export const router = new Router({ }); // server router

router.redirect("/home", "/"); // Redirect /test to /

router.get("Statics", "/statics/es/*.*", statics("apps", {
  prefix: "/statics/es",
}));

router.get("Statics", "/*", statics("public_html"));

// APIs
// router.use("/api", cors(), apis.routes()); // API跨域访问

// Doc router
const docsRouter = new Router({ });

docsRouter.get("Docs", "*", statics("docs", { 
  index: "README.md",
  prefix: "/docs(/*.*)", // 设置prefix后生效
})); 

router.use("/docs(/*.*)", docsRouter.routes());

// ssr
const appPath = path.join(paths.APPS,"App.mjs");
router.all("UI", [ "/", "/*" ], ssr({appPath: appPath}));

// User
const testRouter = new Router();

testRouter.get("user", "/users/:uid", (ctx, next) => {
  debug("params", ctx.params);
  debug("captures", ctx.captures);
  ctx.body = ctx.router.url("user", { id: 180 }, { query: "test=abc"});
  return next();
});
