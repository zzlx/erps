/**
 * *****************************************************************************
 *
 * SSR(Server Side Render) Middleware
 *
 * 用于服务端渲染
 *
 * *****************************************************************************
 */ 

import path from "node:path";
import util from "node:util";
import ReactDOMServer from "react-dom/server";

const debug = util.debuglog("debug:server-ssr");

export function ssr (appPath, options = {}) {
  const opts = Object.assign({}, {
    appPath: appPath,
  }, options);

  debug("SSR options: %j", opts);

  let hasError = false;
  let appModule = import(opts.appPath).catch(e => {
    hasError = true;
    debug(e);
  });

  return async function ssrMiddleware (ctx, next) {
    // 旁路规则
    // 1. with body content
    if (ctx.body !== undefined) return;

    // 2. with extension 
    // if (/\.\w+$/.test(ctx.pathname)) return; // 正则匹配
    if (path.extname(ctx.pathname) != "") return;

    // 进入服务端渲染逻辑
    const appM = appModule.then ? await appModule : appModule;
    const app = appM && appM.default ? appM.default : appM; 

    const initialState = {
      // isSSR: true,
      head: {
        keywords: "erps",
        description: "ERP system.",
        title: "HOME",
      },
      location: { pathname: ctx.pathname },
    };

    const appstring = ReactDOMServer.renderToString(app(initialState));
    ctx.body = renderHTML(appstring, initialState);

    await next();
  }; // end of ssrMiddleware
}

export function renderHTML (appString, initialState = {}) {
  const isDev = process.env.NODE_ENV === "development";
  const isDebug = process.env.NODE_DEBUG != null;
  const react = isDev 
    ? "/statics/js/react.development.js" 
    : "/statics/js/react.production.min.js"; 
  const reactDOM = isDev
    ? "/statics/js/react-dom.development.js" 
    : "/statics/js/react-dom.production.min.js";
  const app = isDev
    ? `/statics/es/index.mjs?env=development${isDebug ? "&debug=true" : ""}`
    : "/statics/es/index.mjs";

  const head = Object.assign({}, {
    keywords: "",
    title: "Homepage",
  }, initialState.head);

  return `<!DOCTYPE html>
<html lang="zh-Hans-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="keywords" content="${head.keywords}">
    <title>${head.title}</title>
    <link rel="stylesheet" href="/statics/stylesheets/styles.css" />
    <script type="module" src="${react}"></script>
    <script type="module" src="${reactDOM}"></script>
    <script type="module" src="${app}"></script>
    <script nomodule src="/statics/es/noModule.js"></script>
  </head>
  <body>
    <div id="app">${appString}</div>
    <noscript>
      <div class="alert alert-warning sticky-top" role="alert">
        <h4 class="alert-heading">提示信息⚠️:</h4>
        <hr/>
        <pre>
          当前客户端未启用JavaScript或不支持JavaScript.
          请启用JavaScript支持或更换客户端后重试!
        </pre>
      </div>
    </noscript>
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify(initialState).replace(/</g, "\\x3c")}
    </script>
  </body>
</html>`;
}
