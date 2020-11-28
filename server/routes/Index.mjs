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
import { 
  statics, 
  serverRender,
  dynamics 
} from '../../src/koa/middlewares/index.mjs';
import settings from '../../src/settings.mjs';

const paths = settings.paths;

export const router = new Router(); // 路由配置
// 静态资源服务配置
//
// 配置前端资源
router.get('/webUI/*', statics(paths.REACT_CLIENT, { prefix: '/webUI' }));

router.get('/api', async (ctx, next) => {
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
settings.isDevel && router.get('/log/*', statics(paths.LOG_PATH, { prefix: '/log' }));

// 命名路由
router.get('www', '/*', statics(paths.WWW_PATH, { directoryIndex: 'index.html'}));

router.get('indexes', '/*',  serverRender({ 
  root: paths.REACT_CLIENT,
  template: settings.templates.HomePageHtml,
}));
