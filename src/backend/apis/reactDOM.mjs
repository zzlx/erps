/**
 * 服务器端react渲染
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
 * @param {object} element that created by react
 * @return {function}
 * @api public
 */

import ReactDOMServer from 'react-dom/server.js';
import React from 'react';

export default function (element) {
    return function domRenderMiddleware(ctx, next) {
        // render to stream
        const retval = ReactDOMServer.renderToString(element);

        ctx.type = 'html';
        ctx.body = retval; 
    }
}
