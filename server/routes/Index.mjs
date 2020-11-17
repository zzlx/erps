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
const{ paths } = settings;
const Index = new Router(); // 路由配置
export default Index;

// 静态资源服务配置
Index.get('/uis', statics(path.join(paths.PUBLIC, 'uis'), { prefix: '/uis' }));
Index.get('/docs', statics(paths.DOCS, {
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

          while (null !== (chunk = ctx.body.read())) {
            data += chunk;
          }

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

// pages目录路由配置
//app.use(dynamics({ path: path.join(paths.SERVER, 'pages') }));

//
// @TODOS:
// 1. 读取log/request.log时,readStream无法关闭
'development' === process.env.NODE_ENV &&
Index.get('/log', statics(paths.LOG_PATH, {prefix: '/log'}));

Index.get('/', statics(paths.WWW_PATH, { directoryIndex: 'index.html'}));
