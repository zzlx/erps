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
 * @param {object} options
 *
 * *****************************************************************************
 */

import ReactDOMServer from 'react-dom/server.js';
import HtmlTemplate from '../utils/HtmlTemplate.mjs';
import ReactApp from '../../../public/assets/es/App.mjs';

export default function serverRender (options = {}) {
  const opts = Object.assign({ template: null, }, options);
  return async function serverRenderMiddleware (ctx, next) {
    // 转发有扩展名的路径至下一中间件
    if (/\.w+$/.test(ctx.pathname)) return next();
    if (ctx.body != null) return next();

    const path = ctx.pathname;

    const ua = ctx.get('user-agent');
    const isIE = /MSIE/.test(ua);

    // @todo: 利用客户端路由进行匹配渲染,以优化SEO
    //const options = JSON.parse(JSON.stringify(opts));
    //if (isIE) options.scripts.unshift({ src: '/assets/js/polyfill.min.js'});

    const html = new HtmlTemplate({template: opts.template}) 

    html.title = '首页|HomePage';
    html.addMeta({ name: 'keywords', content: 'ERP,OA', });
    html.addScript([
      //{ src: "https://hm.baidu.com/hm.js?6d232be7bbac84648183642dea1aac4b" },
      { src: `/assets/js/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
      { src: `/assets/js/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
      { src: `/assets/es/main.mjs${process.env.NODE_ENV === 'development' ? '?env=development' : '' }`, type: 'module', crossOrigin: true },
    ]);

    html.body = ReactDOMServer.renderToString(ReactApp({
      location: {pathname: ctx.pathname}
    }));

    ctx.body = html.render();
    return next();
  }
}
