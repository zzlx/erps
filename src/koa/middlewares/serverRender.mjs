/**
 * *****************************************************************************
 *
 * 服务器端渲染
 * 
 * ReactDOMServer methods:
 *
 * * renderToString(element)
 * * renderToStaticMarkup(element)
 * * renderToNodeStream(element) 
 * * renderToStaticNodeStream(element)
 *
 * @param {object} options
 *
 * *****************************************************************************
 */

import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server.js';
import jsdom from 'jsdom';

globalThis.React = React;

export default function serverRender (options) {
  const opts = Object.assign({
    template: null,
  }, options);

  const ReactApp = import(`${opts.root}/ReactApp.mjs`).then(m => m.default);

  return async function serverRenderMiddleware (ctx, next) {
    // 转发有扩展名的路径至下一中间件
    if (path.extname(ctx.pathname) !== '') return next();
    // @
    if (ctx.body != null) return next();

    const ua = ctx.get('user-agent');
    const isIE = /MSIE/.test(ua);

    // @todo: 利用客户端路由进行匹配渲染,以优化SEO
    //const options = JSON.parse(JSON.stringify(opts));
    //if (isIE) options.scripts.unshift({ src: '/assets/js/polyfill.min.js'});

    const dom = new jsdom.JSDOM(opts.template)
    const document = dom.window.document;
    document.title = 'TEST';

    [
      //{ src: "https://hm.baidu.com/hm.js?6d232be7bbac84648183642dea1aac4b" },
      { src: `/assets/js/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
      { src: `/assets/js/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
      { src: '/webUI/import-map.importmap', type: 'importmap'},
      { src: `/webUI/main.mjs${process.env.NODE_ENV === 'development' ? '?env=development' : '' }`, type: 'module', crossOrigin: true },
    ].forEach(v => {
      addScript.bind(document)(v);
    });

    const container = document.getElementById('root');
    if (container) container.innerHTML = 'test'; // React服务端渲染内容

    ctx.body = dom.serialize();

    return next();
  }
}

function addScript (props) {
  const document = this;
  const script = document.createElement("script");

  for (const key of Object.keys(props)) {

    /*
    if (props[key] === 'module') {
      // 预加载模块
      const link = document.createElement('link');
      link.rel= 'modulepreload';
      link.href= props.src;
      document.head.appendChild(link);
    }
    */

    script[key] = props[key];
  }
  document.head.appendChild(script);
}
