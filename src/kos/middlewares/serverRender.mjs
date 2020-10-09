/**
 * *****************************************************************************
 *
 * 服务器渲染中间件
 * ===============
 *
 * # ReactDOMServer API
 *
 * * renderToString(element)
 * * renderToStaticMarkup(element)
 * * renderToNodeStream(element)
 * * renderToStaticNodeStream(element)
 *
 * *****************************************************************************
 */

import ReactDOMServer from 'react-dom/server.js'
import path from 'path';
import HTMLTemplate from '../../templates/Html.mjs';

export default (opts) => {
  return function (ctx, next) {

    // 转发有扩展名的路径至下一中间件
    if (path.extname(ctx.pathname) !== '') return next();

    // @todo: 利用客户端路由进行匹配渲染,以优化SEO

    // template
    const html = new HTMLTemplate(opts);
    ctx.type = 'html';
    ctx.body = html.render();

    return next();
  }
}
