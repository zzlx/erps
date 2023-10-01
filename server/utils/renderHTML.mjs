/**
 * *****************************************************************************
 *
 * html模版
 *
 *
 * *****************************************************************************
 */

export function renderHTML (appString, options = {}, initialState = {}) {
  const opts = Object.assign({}, {
    keywords: "",
    description: "",
    title: "未命名|Untitled",
    scripts: [],
  }, options);

  return `<!DOCTYPE html>
<html lang="zh-Hans-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${opts.description}">
    <meta name="keywords" content="${opts.keywords}">
    <title>${opts.title}</title>
    <link rel="stylesheet" href="/statics/stylesheets/styles.css" />
    ${opts.scripts.map(s => `    <script type="module" src="${s}"></script>`)}
    <script nomodule src="/statics/es/noModule.js"></script>
  </head>
  <body>
    <div id="app">${appString}</div>
    <noscript>
      <div class="alert alert-warning sticky-top" role="alert">
        <h4 class="alert-heading">提示信息⚠️:</h4>
        <hr/>
        <pre>
          当前客户端未启用JavaScript或不支持JavaScript.
          请启用JavaScript支持或更换客户端后重试!
        </pre>
      </div>
    </noscript>
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify(initialState).replace(/</g, "\\x3c")}
    </script>
  </body>
</html>`;
}
