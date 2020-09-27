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

export default (opts) => {

  return function (ctx, next) {
    // 转发有扩展名的路径至下一中间件
    if (path.extname(ctx.path) !== '') return next();


    // @todo: 利用客户端路由进行匹配渲染,以优化SEO

    const html = new HTMLRender(opts);

    ctx.type = 'html';
    ctx.body = html.render();
  }
}

class HtmlRender {
  constructor(props) {
    this.state = Object.assign({}, {
      title: 'Untitled',
      charset: 'UTF-8',
      body: null,
      initialState: Object.create(null),
      scriptTags: [],
      keywords: [],
      viewport: "width=device-width, initial-scale=1.0, shrink-to-fit=no",
      description: '',
      scripts: [],
      styles: [],
    }, props);

    // 解析html
    //this.sourceHtml = arguments[0];
    //if (this.sourceHtml) this.parse();

  }

  setKeywords () {
    const keys = Array.prototype.slice.call(arguments);
    this.state.keywords = keys;
    return this;
  }

  setCharset (value) {
    if (typeof value !== 'string') throw new TypeError('Value must be string.');
    this.state.charset = value;
    return this;
  }

  setTitle (value) {
    if (typeof value !== 'string') throw new TypeError('Value must be string.');
    this.state.title = value;
    return this;
  }

  setBody (value) {
    if (typeof value !== 'string') throw new TypeError('Value must be string.');
    this.state.body = value;
    return this;
  }

  parse () {
    return this
  }

  toString () {
    return this.render();
  }

  render () {
    return `<!DOCTYPE html>
<html lang="zh-cmn-Hans">
  <head>
    <meta charset="${this.state.charset}" />
    <meta name="keywords" content="${this.state.keywords.join(',')}" />
    <meta name="description" content="${this.state.description}" />
    <meta name="viewport" content="${this.state.viewport}" />
    <title>${this.state.title}</title>
    ${ this.state.styles && this.state.styles.map(href => 
      `<link rel="stylesheet" href="${href}" />`).join('\n    ') }
    ${ this.state.scripts && this.state.scripts.map(v => 
      `<script src="${v.src}"${v.module === true ? ' type="module"' : v.nomodule === true ? ' nomodule' : ''}></script>`
    ).join('\n    ')}
  </head>
  <body>
    <noscript>请确认已启用javascript支持.</noscript>
    <div id="root">${this.state.body || ''}</div>
    <script>
      window.env = '${process.env.NODE_ENV}';
      window.__INITIAL__STATE__ = ${JSON.stringify(this.state.initialState)};
    </script>
  </body>
</html>`;
  }
}
