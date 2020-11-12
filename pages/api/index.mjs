/**
 * *****************************************************************************
 *
 *
 *
 * *****************************************************************************
 */

export default function api () {
  if (this == null) return;
  const ctx = this;
  ctx.type = 'html';
  const html = new HTMLTemplate({ styles: ['/assets/css/styles.css'], });
  const md = new Remarkable({ html: true, });
  html.body = '<div class="container markdown">' + 
    md.render(fs.readFileSync(path.join(paths.SERVER, 'pages', 'api', 'README.md'), 'utf8')) +
  '</div>';

  html.title = 'API数据服务';
  ctx.body = html.render();

}
