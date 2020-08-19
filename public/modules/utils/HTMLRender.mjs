/**
 * *****************************************************************************
 *
 * Html Parser
 *
 * @todo: 
 * html字串解析、修改、再输出等功能
 * 读取html模版并解析\插入服务端渲染内容
 *
 *
 * *****************************************************************************
 */

export default class HtmlParser {
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
      scripts: [
        { src: `/statics/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
        { src: `/statics/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
        { src: "/modules/web-client.mjs", module: true },
        { src: "/modules/fallback.js", nomodule: true},
      ],
      styleLinks: [ 
        "/statics/styles.css"
      ],
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
    this.html = `<!DOCTYPE html>
<html lang="zh-cmn-Hans">
  <head>
    <meta charset="${this.state.charset}" />
    <meta name="keywords" content="${this.state.keywords.join(',')}" />
    <meta name="description" content="${this.state.description}" />
    <meta name="viewport" content="${this.state.viewport}" />
    <title>${this.state.title}</title>
    ${ this.state.styleLinks && this.state.styleLinks.map(href => 
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
      window.__INITIAL_STATE__ = ${JSON.stringify(this.state.initialState)};
    </script>
  </body>
</html>`;

    return this.html;
  }
}
