/**
 * *****************************************************************************
 *
 * HTML模板
 *
 * *****************************************************************************
 */

export default function (opts) {
  return new HTMLTemplate(opts);
}

class HTMLTemplate {
  constructor(props) {
    this.state = Object.assign({}, {
      title: 'Untitled',
      charset: 'UTF-8',
      body: null,
      scriptTags: [],
      keywords: [],
      viewport: "width=device-width, initial-scale=1.0, shrink-to-fit=no",
      description: '',
      scripts: [],
      styles: [],
      initialState: Object.create(null), // 传给页面的初始数据
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

  set charset (value) {
    if (typeof value !== 'string') throw new TypeError('Value must be string.');
    this.state.charset = value;
    return this;
  }

  set title (value) {
    if (typeof value !== 'string') throw new TypeError('Value must be string.');
    this.state.title = value;
    return this;
  }

  set body (value) {
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
  </body>
</html>`;
  }
}
