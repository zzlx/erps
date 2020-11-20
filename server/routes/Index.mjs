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

const { 
  PUBLIC,
  LOG_PATH,
  WWW_PATH,
  DOCS,
  SERVER,
} = settings.paths;

const Index = new Router(); // 路由配置
export default Index;

// 静态资源服务配置
Index.get('/uis', statics(path.join(PUBLIC, 'uis'), { prefix: '/uis' }));
Index.get('/docs', statics(DOCS, {
  prefix: '/docs', 
  directoryIndex: 'README.md'
}), async (ctx, next) => {
  consoe.log(ctx.pathname);
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
  console.log(ctx.pathname);
  ctx.body = 'test';
});
