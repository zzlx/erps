/**
 * *****************************************************************************
 * 
 * Main routes
 *
 * *****************************************************************************
 */

import path from 'path';
import settings from '../../config/index.mjs';

import Router from '../../src/koa/Router.mjs';
import dynamics from '../../src/koa/middlewares/dynamics.mjs';
import statics from '../../src/koa/middlewares/statics.mjs';
import serverRender from '../../src/koa/middlewares/serverRender.mjs';

const router = new Router(); // 路由配置

// 静态资源服务配置
//
router.get('/api', async (ctx, next) => {
  ctx.type = 'html';
  const html = new HTMLTemplate({ styles: ['/assets/css/styles.css'], });
  const md = new Remarkable({ html: true, });

  html.body = '<div class="container markdown">' + 
    md.render(fs.readFileSync(path.join(settings.paths.SERVER, 'README.md'))) +
  '</div>';

  html.title = 'API数据服务';
  ctx.body = html.render();
});

//
// @TODOS:
// 1. 读取log/request.log时,readStream无法关闭
settings.isDevel && 
router.get('/log/*', statics(settings.paths.LOG_PATH, { prefix: '/log' }));

// 配置前端资源
router.get('public', '/*', statics(settings.paths.PUBLIC));

// named route
router.get('www', '/*', statics(settings.paths.WWW_PATH, { 
  directoryIndex: 'index.html'
}));

router.get('index', '/*',  serverRender({ 
  app: path.join(settings.paths.PUBLIC, 'assets', 'esm', 'App.mjs'),
  template: settings.templates.IndexHtml,
}));

export default router;
