/**
 * *****************************************************************************
 *
 * 服务器路由
 *
 *
 *
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import Remarkable from 'remarkable';

import settings from './config/settings.mjs';
import Router from '../src/koa/Router.mjs';
import statics from '../src/koa/middlewares/statics.mjs';
import serverRender from '../src/koa/middlewares/serverRender.mjs';
import Html from '../src/templates/Html.mjs';
import { readDir } from '../src/utils.node.mjs';

const debug = util.debuglog('debug:routes.mjs');
const paths = settings.paths;
const routes = new Router({});
export default routes; // 输出路由配置

/**
 * 当发生样式文件修改时，自动重建styles.css文件
 */

process.env.NODE_ENV === 'development' && routes.get('/*', async (ctx, next) => {
  const pathname = ctx.pathname;

  if (pathname === '/assets/react-dom.development.js' ||
      pathname === '/assets/react-dom.production.min.js') {
    if (!fs.existsSync(path.join(paths.PUBLIC, pathname))) {
      const s = path.join(paths.NODE_MODULES, 'react-dom', 'umd', path.basename(pathname));
      const o = path.join(paths.PUBLIC, pathname);
      await fs.promises.mkdir(path.dirname(o), {recursive: true});
      if (fs.existsSync(s)) await fs.promises.copyFile(s, o);
    }
  }

  if (pathname === '/assets/react.development.js' ||
      pathname === '/assets/react.production.min.js') {
    if (!fs.existsSync(path.join(paths.PUBLIC, pathname))) {
      const s = path.join(paths.NODE_MODULES, 'react', 'umd', path.basename(pathname));
      const o = path.join(paths.PUBLIC, pathname);
      await fs.promises.mkdir(path.dirname(o), {recursive: true});
      if (fs.existsSync(s)) await fs.promises.copyFile(s, o);
    }
  }

  if (pathname === '/assets/styles.css') {
    const scssFiles = readDir(path.join(paths.SRC, 'scss'));
    const cssFile = path.join(paths.PUBLIC, 'assets', 'styles.css');
    await fs.promises.mkdir(path.dirname(cssFile), {recursive: true});
    const cssStats = fs.lstatSync(cssFile);

    for (let file of scssFiles) {
      const stats = fs.lstatSync(file);
      if (stats.mtime > cssStats.ctime) {
        // @todo: 
        await cp.spawn(path.join(paths.BIN, 'css-render.mjs'));
        break;
      }
    }
  }

  await next();
});

routes.get('/docs*', (ctx, next) => {

  let file = path.join(paths.DOCS, path.relative('/docs', ctx.pathname));
  if (file === paths.DOCS) file = path.join(file, 'README.md');
  if (path.extname(file) === '') file += '.md'
  if (!fs.existsSync(file)) return next();

  ctx.type = 'html';
  const html = new Html({ styles: ['/statics/css/styles.css'], });
  const md = new Remarkable({
    html: true,
  });

  const content = fs.readFileSync(file, 'utf8');
  const body = ctx.searchParams.get('raw') 
      ? `<pre contenteditable="true">${content}</pre>` 
      : md.render(content);

  html.body = `<div class="container markdown">${body}</div>`;

  ctx.body = html.render();
});

// 将api路由附加至index
routes.all('/api*', async (ctx, next) => {
  //if (ctx.pathname === 'favicon.ico') return await next();
  const apiFile = path.join(paths.SERVER, 'pages', path.relative('/', ctx.pathname) + '.mjs');

  if (fs.existsSync(apiFile)) {
    return await import(apiFile).then(m => m.default).then(app => {
      app(ctx);
    });
  }

  ctx.type = 'html';
  const html = new Html({ styles: ['/assets/styles.css'], });
  const md = new Remarkable({
    html: true,
  });

  html.body = '<div class="container markdown">' + 
    md.render(fs.readFileSync(path.join(paths.SERVER, 'pages', 'api', 'README.md'), 'utf8')) +
  '</div>';

  html.title = 'API数据服务';
  ctx.body = html.render();
});

routes.get('/*', 
  statics({ root: paths.PUBLIC }),
  serverRender({
    styles: [ "/assets/styles.css" ],
    scripts: [
      { src: `/assets/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
      { src: `/assets/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
      { src: "/modules/main.mjs", module: true, crossorigin: true },
      { src: "/modules/fallback.js", nomodule: true},
    ],
  }), 
);
