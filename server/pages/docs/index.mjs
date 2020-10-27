/**
 *
 *
 *
 *
 *
 *
 *
 */

export default function docs (ctx) {
  // 开发环境下访问至特定路径时才执行的任务
  let file = path.join(paths.DOCS, path.relative('/docs', ctx.pathname));
  if (file === paths.DOCS) file = path.join(file, 'README.md');
  if (path.extname(file) === '') file += '.md'
  if (!fs.existsSync(file)) return next();

  ctx.type = 'html';
  const html = new HTMLTemplate({ styles: ['/assets/css/styles.css'], });
  const md = new Remarkable({
    html: true,
  });

  const content = fs.readFileSync(file, 'utf8');
  const body = ctx.searchParams.get('raw') 
      ? `<pre contenteditable="true">${content}</pre>` 
      : md.render(content);

  html.body = `<div class="container markdown">${body}</div>`;

  ctx.body = html.render();
}
