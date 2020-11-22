/**
 * *****************************************************************************
 * 
 * 路由配置
 *
 * *****************************************************************************
 */

import path from 'path';
import { Router, statics, dynamics } from '../../src/koa/Application.mjs';
import settings from '../../src/settings.mjs';

const paths = settings.paths;

const { 
  FRONTEND,
  PUBLIC,
  LOG_PATH,
  WWW_PATH,
  DOCS,
  SERVER,
} = settings.paths;

const Index = new Router(); // 路由配置
export default Index;

// 静态资源服务配置
//
// 配置前端资源
Index.get('/ESModules', statics(paths.FRONTEND, { prefix: '/ESModules' }));

Index.get('api', (ctx, next) => {
  ctx.type = 'html';
  const html = new HTMLTemplate({ styles: ['/assets/css/styles.css'], });
  const md = new Remarkable({ html: true, });
  html.body = '<div class="container markdown">' + 
    md.render(fs.readFileSync(path.join(paths.SERVER, 'pages', 'api', 'README.md'), 'utf8')) +
  '</div>';

  html.title = 'API数据服务';
  ctx.body = html.render();
});

Index.get('/docs', statics(DOCS, {
  prefix: '/docs', 
  directoryIndex: 'README.md'
}), async (ctx, next) => {
  // 用于对输出的markdown文档片段进行处理
  if ('text/markdown' === ctx.type && ctx.searchParams.get('raw') !== "true") {
    if (ctx.body && typeof ctx.body.pipe === 'function') {
      const content = await new Promise((resolve, reject) => {
        ctx.body.on('readable', () => {
          let data = '';
          let chunk = null;
          while (null != (chunk = ctx.body.read())) data += chunk;
          resolve(data);
        });
      });

      ctx.body = content;
    }

    ctx.type = 'html';
    const md = new Remarkable();
    ctx.body = md.render(ctx.body);
  }

  return next();
});

//
// @TODOS:
// 1. 读取log/request.log时,readStream无法关闭
'development' === process.env.NODE_ENV &&
Index.get('/log', statics(LOG_PATH, {prefix: '/log'}));

//statics(WWW_PATH, { directoryIndex: 'index.html'}));
Index.get('/', (ctx, next) => {
  ctx.body = 'test';
});
