/**
 * *****************************************************************************
 * 
 * 路由配置
 *
 * *****************************************************************************
 */

import path from 'path';
import jsdom from 'jsdom';

import Router from '../../src/koa/Router.mjs';
import { statics, dynamics } from '../../src/koa/middlewares/index.mjs';
import settings from '../../src/settings.mjs';

const paths = settings.paths;
const templates = settings.templates;

const { 
  FRONTEND,
  PUBLIC,
  LOG_PATH,
  WWW_PATH,
  DOCS,
  SERVER,
} = settings.paths;

const router = new Router(); // 路由配置

// 静态资源服务配置
//
// 配置前端资源
router.get('/webUI/*', statics(paths.FRONTEND, { prefix: '/webUI' }));

router.get('/api', (ctx, next) => {
  ctx.type = 'html';
  const html = new HTMLTemplate({ styles: ['/assets/css/styles.css'], });
  const md = new Remarkable({ html: true, });
  html.body = '<div class="container markdown">' + 
    md.render(fs.readFileSync(path.join(paths.SERVER, 'README.md'), 'utf8')) +
  '</div>';

  html.title = 'API数据服务';
  ctx.body = html.render();
});

//
// @TODOS:
// 1. 读取log/request.log时,readStream无法关闭
settings.isDevel && router.get('/log/*', statics(LOG_PATH, { prefix: '/log' }));

router.get('www', '/*', statics(WWW_PATH, { directoryIndex: 'index.html'}));

// indexes route
router.get('indexes', '/*',  (ctx, next) => {
  if (ctx.body) return next();

  const dom = new jsdom.JSDOM(templates.html)
  dom.window.document.title = 'TEST';

  ctx.body = dom.serialize();

  return next();
});

export default router;
