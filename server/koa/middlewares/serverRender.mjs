/**
 * *****************************************************************************
 *
 * 服务器渲染中间件
 *
 * ReactDOMServer
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
import util from 'util';
import config from '../../config.mjs';
import { HTMLRender } from '../../utils.mjs'; 

export default () => {
  const debug = util.debuglog('debug:server-render-middleware');

  return function (ctx, next) {
    console.log(ctx);


    // 转发中间件
    if (path.extname(ctx.path) !== '') return next();

    const html = new HTMLRender({
      title: 'TEST',
    });

    ctx.type = 'html';
    ctx.body = html.render();
  }
}
