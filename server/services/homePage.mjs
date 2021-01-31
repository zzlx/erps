/**
 * *****************************************************************************
 * 
 * homePage
 *
 * *****************************************************************************
 */

import ReactDOMServer from 'react-dom/server.js';
import fs from 'fs';
import path from 'path';
import settings from '../settings/index.mjs';
import HtmlTemplate from '../HtmlTemplate.mjs';
import Router from '../koa/Router.mjs';
import debuglog from '../debuglog.mjs';

const debug = debuglog('debug:routes/homePage.mjs');
const router = new Router();
const template = fs.readFileSync(path.join(settings.paths.PUBLIC, 'index.html'), 'utf8');

router.get('index', '/*', async (ctx, next) => {
  // 转发有扩展名的路径至下一中间件
  if (/\.\w+$/.test(ctx.pathname)) return next();

  if (ctx.body != null) return next();

  const ua = ctx.get('user-agent');
  const isIE = /MSIE/.test(ua);

  // @todo: 利用客户端路由进行匹配渲染,以优化SEO
  //const options = JSON.parse(JSON.stringify(opts));
  //if (isIE) options.scripts.unshift({ src: '/assets/js/polyfill.min.js'});

  const html = new HtmlTemplate({template: template}) 

  // @TODO:根据路由信息动态更新title
  html.title = '首页|HomePage';
  //html.addMeta({ name: 'keywords', content: 'ERP,OA', });
  html.addScript([
    //{ src: "https://hm.baidu.com/hm.js?6d232be7bbac84648183642dea1aac4b" },
    { src: `/assets/js/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
    { src: `/assets/js/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
    { src: `/assets/es/main.mjs${process.env.NODE_ENV === 'development' ? '?env=development' : '' }`, type: 'module', crossOrigin: true },
  ]);

  if (process.env.NODE_ENV === 'development') {
    const appURL = path.join(settings.paths.REACT_CLIENT, 'ReactApp.mjs'); 
    const ReactApp = await import(appURL).then(m => m.default);
    const element = ReactApp({
      location: { pathname: ctx.pathname }
    });
    const container = html.getElementById('root')
    container.innerHTML = ReactDOMServer.renderToString(element);
  }

  ctx.body = html.render();
  next();
});

export default router.routes();
export const allowedMethods = router.allowedMethods();
