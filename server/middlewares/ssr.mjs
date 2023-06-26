/**
 * *****************************************************************************
 *
 * SSR(Server Side Render) Middleware
 * 服务端渲染中间价 
 *
 * *****************************************************************************
 */ 

import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import ReactDOMServer from 'react-dom/server';
import { HTTP_STATUS } from '../constants.mjs';

const debug = util.debuglog('debug:ssr-middleware');

export function ssr (opts = {}) {
  let appPath = opts.appPath;

  let appModule = import(appPath).catch(e => {
    debug(e);
  });

  return async function ssrMiddleware (ctx, next) {

    await next();

    // 服务器端渲染旁路条件:
    // 1. 静态资源一般均有扩展名
    if (path.extname(ctx.pathname) != "") return;

    // @TODO:前端代码热加载支持

    const appM = await appModule;
    const app = appM && appM.default ? appM.default : appM; 

    // bypass conditions:
    // 1. with extension 
    if (/\.\w+$/.test(ctx.pathname)) return;

    // 2. with body content
    if (ctx.body != null) return;
    
    let didError = false;
    let timer = () => {};

    const initialState = {
      isSSR: true,
      head: {
        keywords: 'erps',
        description: 'ERP system.',
        title: 'HOME',
      },
      location: { pathname: ctx.pathname } // set path location
    };

    const appstr = ReactDOMServer.renderToString(app(initialState));
    const html = renderHTML(appstr, initialState);
    ctx.body = html;

    /* 
    await new Promise((resolve, reject) => {
      const stream = ReactDOMServer.renderToPipeableStream(App, { 
        onShellReady: () => {
          // The content above all Suspense boundaries is ready
          // if something errored before stream start, 
          // set the error code appropriately.
          ctx.status = didError ? 500 : 200;
          ctx.type = 'html';
          ctx.body = stream;
          debug('onShellReady');
          resolve();
        },
        onShellError: error => {
          debug('onShellError');
          // something errored before the shell complete,
          // emit an alternative shell
          ctx.status = 500;
        },
        onAllReady: () => {

          // if don't want use streaming
          // use this instead of onShellReady.
          debug(stream);
          ctx.type = 'html';
          resolve();
        },
        onError: error => {
          didError = true;
          ctx.throw(error);
          reject();
        }
      }); 


      // abort ssr
      timer = setTimeout(stream.abort, 200);


    }); // end of promise
    */
    
  }
}

export function renderHTML (appString, initialState = {}) {
  const isDev = process.env.NODE_ENV === 'development';
  const react = isDev 
    ? "/statics/js/react.development.js" 
    : "/statics/js/react.production.min.js"; 
  const reactDOM = isDev
    ? "/statics/js/react-dom.development.js" 
    : "/statics/js/react-dom.production.min.js";
  const app = isDev
    ? "/statics/es/index.mjs?env=development"
    : "/statics/es/index.mjs";

  const head = Object.assign({}, {
    keywords: '',
    title: 'Homepage',
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
      window.__PRELOADED_STATE__ = ${JSON.stringify(initialState).replace(/</g, '\\x3c')}
    </script>
  </body>
</html>`;
}
