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
import settings from '../../settings/index.mjs';
import HtmlTemplate from '../../utils/HtmlTemplate.mjs';
import Router from '../../koa/Router.mjs';
import UI from '../../webUI/main.mjs';

const debug = util.debuglog('debug:routes/homePage.mjs');
const router = new Router();
const template = path.join(settings.paths.PUBLIC, 'index.html');;

router.get('index', '/*', async (ctx, next) => {
  // 转发有扩展名的路径至下一中间件
  if (/\.w+$/.test(ctx.pathname)) return next();
  if (ctx.body != null) return next();

  const path = ctx.pathname;
  const app = new UI({
    location: { pathname: ctx.pathname }
  });

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

  const container = html.getElementById(app.CID)
  container.innerHTML = ReactDOMServer.renderToString(app.element);

  ctx.body = html.render();
  return next();
});

export default router.routes();
export const allowedMethods = router.allowedMethods();
