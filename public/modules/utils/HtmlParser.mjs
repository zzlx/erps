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
  constructor() {

    this.sourceHtml = arguments[0];
    this.title = 'Undefined-Title';
    this.charset = 'UTF-8';
    this.body = null;
    this.scriptTags = [
      { crossorigin: false },
    ];

    this.keywords = null;

    // 解析html
    if (this.sourceHtml) this.parse();

  }

  setKeywords () {
    const keys = Array.prototype.slice.call(arguments);
    this.keywords = keys;
    return this;
  }

  setCharset (value) {
    if (typeof value !== 'string') throw new TypeError('Value must be string.');
    this.charset = value;
    return this;
  }

  setTitle (value) {
    if (typeof value !== 'string') throw new TypeError('Value must be string.');
    this.title = value;
    return this;
  }

  setBody (value) {
    if (typeof value !== 'string') throw new TypeError('Value must be string.');
    this.body = value;
    return this;
  }

  parse () {

    return this
  }

  toHTML () {
  }

  render () {
    this.html = `<!DOCTYPE html>
<html lang="zh-cmn-Hans">
  <head>
    <meta charset="${this.charset}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />
    <link rel="stylesheet" href="/statics/styles.css" />
    <script src="/statics/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js"></script>
    <script src="/statics/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js"></script>
    <script type="module" src="/modules/main.mjs"></script>
    <!-- 浏览器不支持es module时进行提醒⏰ -->
		<script nomodule src="/modules/fallback.js"></script>
    <script>
      window.env = '${process.env.NODE_ENV}'
    </script>
    <title>${this.title}</title>
  </head>
  <body>
    <noscript>请确认已启用javascript支持.</noscript>
    <div id="root">${this.body || ''}</div>
  </body>
</html>`;

    return this.html; 
  }
}
