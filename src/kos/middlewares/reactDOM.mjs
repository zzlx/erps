/**
 * *****************************************************************************
 *
 * react render
 *
 * render方法:
 * 1. renderToString: 返回html字符串,用于首页响应速度及SEO目的
 * 2. renderToStaticMarkup: 返回不包含data属性的html字串
 * 3. renderToNodeStream: 
 * 4. renderToStaticNodeStream:
 *
 * @todo: 服务器端渲染还需解决的问题：
 * 1. 使用字符串拼接的办法将render输出
 * 2. 使用html模块构建页面
 *
 * ReactDOMServer.renderToString(element)
 * ReactDOMServer.renderToStaticMarkup(element)
 *
 * If you plan to use React on the client to make the markup interactive, 
 * do not use this method. Instead, 
 * use renderToString on the server and ReactDOM.hydrate() on the client.
 *
 * *****************************************************************************
 */

import util from 'util';
import ReactDOMServer from 'react-dom/server.js';

const debug = util.debuglog('debug:react-render-middleware');

export default function () {

  return async function reactRenderMiddleware (ctx, next) {
    Object.defineProperty(ctx, 'ReactDOMServer', {
      get: function() {
        return ReactDOMServer;
      },
      enumerable : true,
      configurable : true,
    });

    await next();
  }
}
