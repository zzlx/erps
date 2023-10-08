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
import { renderHTML } from "../utils/renderHTML.mjs";

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

    const isDev = process.env.NODE_ENV === "development";
    const isDebug = process.env.NODE_DEBUG != null;

    const initialState = {
      // isSSR: true,
      head: {
        keywords: "erps",
        description: "ERP system.",
        title: "HOME",
        scripts: [
          isDev ? "/statics/js/react.development.js" : "/statics/js/react.production.min.js",
          isDev ? "/statics/js/react-dom.development.js" : "/statics/js/react-dom.production.min.js",
          isDev ? `/statics/es/index.mjs?env=development${isDebug ? "&debug=true" : ""}` : "/statics/es/index.mjs",
        ],
      },
      location: { pathname: ctx.pathname },
    };

    const appstring = ReactDOMServer.renderToString(app(initialState));
    ctx.body = renderHTML(appstring, initialState.head);

    await next();
  }; // end of ssrMiddleware
}
