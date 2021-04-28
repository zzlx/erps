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
import { paths } from '../settings/index.mjs';
import HtmlTemplate from '../HtmlTemplate.mjs';
import Router from './Router.mjs';
import debuglog from '../debuglog.mjs';

const debug = debuglog('debug:routes/homePage.mjs');
const router = new Router();
const template = fs.readFileSync(path.join(paths.PUBLIC, 'index.html'), 'utf8');


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

  const appURL = path.join(paths.PUBLIC, 'assets', 'es', 'App.mjs'); 
  const app = await import(appURL).then(m => m.default);
  const element = app({
    location: { pathname: ctx.pathname }
  });
  const container = html.getElementById('root')
  container.innerHTML = ReactDOMServer.renderToString(element);

  ctx.body = html.render();
  next();
});

export default router.routes();
export const allowedMethods = router.allowedMethods();
