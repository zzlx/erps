/**
 * *****************************************************************************
 * 
 * Docs
 *
 *
 * *****************************************************************************
 */

import path from 'path';
import { Router, statics, dynamics } from '../../src/koa/Application.mjs';
import settings from '../../src/settings.mjs';

const paths = settings.paths;

const router = new Router(); // 路由配置

router.get('/', statics(paths.DOCS, {
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

export default router;
