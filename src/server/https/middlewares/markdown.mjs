/**
 * *****************************************************************************
 * 
 * Markdown middlewares
 *
 * 用于讲markdown文件格式化为html内容
 *
 *
 *
 * *****************************************************************************
 */

import Remarkable from 'remarkable';

export function markdown () {
  return async function markdownMiddleware (ctx, next) {
    // process content by url?raw=true
    if ('text/markdown' === ctx.type && ctx.searchParams.get('format') === "html") {
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

      ctx.type = 'html'; // reset ctx.type
      const md = new Remarkable();
      ctx.body = md.render(ctx.body);
    }

    return next();
  }
}
