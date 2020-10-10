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

import settings from '../config/settings.mjs';
import Router from '../src/kos/Router.mjs';
import statics from '../src/kos/middlewares/statics.mjs';
import serverRender from '../src/kos/middlewares/serverRender.mjs';
import Html from '../src/templates/Html.mjs';
import readDir from '../src/utils/readDir.mjs';

const debug = util.debuglog('debug:routes.mjs');
const paths = settings.paths;
const routes = new Router({});
export default routes; // 输出路由配置

/**
 * 当发生样式文件修改时，自动重建styles.css文件
 */

process.env.NODE_ENV === 'development' && routes.get('/*', async (ctx, next) => {
  const pathname = ctx.pathname;

  if (pathname === '/statics/js/react-dom.development.js' ||
      pathname === '/statics/js/react-dom.production.min.js') {
    if (!fs.existsSync(path.join(paths.PUBLIC, pathname))) {
      const s = path.join(paths.NODE_MODULES, 'react-dom', 'umd', path.basename(pathname));
      const o = path.join(paths.PUBLIC, pathname);
      await fs.promises.mkdir(path.dirname(o), {recursive: true});
      if (fs.existsSync(s)) await fs.promises.copyFile(s, o);
    }
  }

  if (pathname === '/statics/js/react.development.js' ||
      pathname === '/statics/js/react.production.min.js') {
    if (!fs.existsSync(path.join(paths.PUBLIC, pathname))) {
      const s = path.join(paths.NODE_MODULES, 'react', 'umd', path.basename(pathname));
      const o = path.join(paths.PUBLIC, pathname);
      await fs.promises.mkdir(path.dirname(o), {recursive: true});
      if (fs.existsSync(s)) await fs.promises.copyFile(s, o);
    }
  }

  if (pathname === '/statics/css/styles.css') {
    const scssFiles = readDir(path.join(paths.SRC, 'scss'));
    const cssFile = path.join(paths.PUBLIC, 'statics', 'css', 'styles.css');
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


  // 是否保持原格式
  if (ctx.searchParams.get('raw')) {
    ctx.type = '.md';
    ctx.body = fs.createReadStream(file);
    return;
  }

  ctx.type = 'html';
  const html = new Html({ styles: ['/statics/css/styles.css'], });
  const md = new Remarkable({
    html: true,
  });

  html.body = '<div class="container markdown">' + 
    md.render(fs.readFileSync(file, 'utf8')) +
  '</div>';

  ctx.body = html.render();
});

// 将api路由附加至index
routes.all('/api*', async (ctx, next) => {
  //if (ctx.pathname === 'favicon.ico') return await next();
  const apiFile = path.join(paths.SERVER, 'apis', path.relative('/api', ctx.pathname) + '.mjs');

  if (fs.existsSync(apiFile)) {
    return await import(apiFile).then(m => m.default).then(app => {
      app(ctx);
    });
  }

  ctx.type = 'html';
  const html = new Html({ styles: ['/statics/css/styles.css'], });
  const md = new Remarkable({
    html: true,
  });

  html.body = '<div class="container markdown">' + 
    md.render(fs.readFileSync(path.join(paths.SERVER, 'apis', 'README.md'), 'utf8')) +
  '</div>';

  ctx.body = html.render();
});

routes.get('/*', 
  statics({ root: paths.PUBLIC }),
  serverRender({
    styles: [ "/statics/css/styles.css" ],
    scripts: [
      { src: `/statics/js/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
      { src: `/statics/js/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
      { src: "/modules/main.mjs", module: true, crossorigin: true },
      { src: "/modules/fallback.js", nomodule: true},
    ],
  }), 
);
