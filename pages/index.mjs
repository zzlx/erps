/**
 * *****************************************************************************
 *
 * 服务器端渲染
 * 
 * ReactDOMServer methods:
 *
 * * renderToString(element)
 * * renderToStaticMarkup(element)
 * * renderToNodeStream(element) 
 * * renderToStaticNodeStream(element)
 *
 * *****************************************************************************
 */

import path from 'path';
import ReactDOMServer from 'react-dom/server.js';

import htmlTemplate from '../server/utils/htmlTemplate.mjs';
//import reactApp from '../public/reactApp.mjs'; // @caution: async module
//import Store from '../public/utils/ReduxStore.mjs';

// 服务端渲染
const opts = {
  styles: [ "/assets/css/styles.css" ],
  scripts: [
    //{ src: "https://hm.baidu.com/hm.js?6d232be7bbac84648183642dea1aac4b" },
    { src: `/assets/js/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
    { src: `/assets/js/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
    { src: `/assets/index.mjs${process.env.NODE_ENV === 'development' ? '?env=development' : '' }`, module: true, crossorigin: true },
    { src: "/assets/noFallback.js", nomodule: true},
  ],
};

export default async function (ctx) {
  // 转发有扩展名的路径至下一中间件
  if (path.extname(ctx.pathname) !== '') return;
  if (ctx.body != null) return;

  const ua = ctx.get('user-agent');
  const isIE = /MSIE/.test(ua);

  // @todo: 利用客户端路由进行匹配渲染,以优化SEO

  const options = JSON.parse(JSON.stringify(opts));
  if (isIE) options.scripts.unshift({ src: '/assets/js/polyfill.min.js'});

  // template
  const html = htmlTemplate(options);
  //const store = createStore({location: {pathname: ctx.pathname}});
  //html.body = ReactDOMServer.renderToString(element);
  html.body = ctx.pathname;
  ctx.type = 'html';
  ctx.body = html.render();
}
