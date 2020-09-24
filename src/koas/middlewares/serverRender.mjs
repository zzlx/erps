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
import HTMLRender from '../../utils/HTMLRender.mjs'; 

export default (clientRoutes) => {

  return function (ctx, next) {
    // 转发有扩展名的路径至下一中间件
    if (path.extname(ctx.path) !== '') return next();


    // @todo: 利用客户端路由进行匹配渲染,以优化SEO

    const html = new HTMLRender();

    ctx.type = 'html';
    ctx.body = html.render();
  }
}
