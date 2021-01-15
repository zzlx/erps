/**
 * *****************************************************************************
 * 
 * homePage
 *
 * *****************************************************************************
 */

import ReactDOMServer from 'react-dom/server.js';
import path from 'path';
import util from 'util';
import settings from '../../settings.mjs';
import HtmlTemplate from '../../utils/HtmlTemplate.mjs';
import Router from '../koa/Router.mjs';

const debug = util.debuglog('debug:routes/homePage.mjs');
const router = new Router();
const template = settings.templates.HomePageHtml;

router.get('index', '/*', async (ctx, next) => {
  // 转发有扩展名的路径至下一中间件
  if (/\.w+$/.test(ctx.pathname)) return next();
  if (ctx.body != null) return next();

  const path = ctx.pathname;
  //import App, { CID, getContainerByID } from '../../uis/main.mjs';
  const M = await import('../../UIs/main.mjs').catch(err => {
    ctx.throw(err)
  });
  const Store = await import('../../UIs/redux/Store.mjs')
    .then(m => m.default)
    .catch(err => ctx.throw(err));
  const { CID, getContainerByID } = M;
  const App = M.default;

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

  const store = new Store({
    location: { pathname: ctx.pathname }
  });

  const container = getContainerByID.call(html, CID)
  container.innerHTML = ReactDOMServer.renderToString(App(store));

  ctx.body = html.render();
  return next();
});

export default router.routes();
export const allowedMethods = router.allowedMethods();
