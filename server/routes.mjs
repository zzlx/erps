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
import serverRender, { 
  HTMLTemplate as Html 
} from '../src/koa/middlewares/serverSideRendering.mjs';

const debug = util.debuglog('debug:routes.mjs');
const paths = settings.paths;
const routes = new Router({});
export default routes; // 输出路由配置

/**
 * 当发生样式文件修改时，自动重建styles.css文件
 */

process.env.NODE_ENV === 'development' && routes.get('/*', async (ctx, next) => {
  const pathname = ctx.pathname;

  if (pathname === '/css/styles.css') {
    const scssFiles = readDir(path.join(paths.SRC, 'scss'));
    const cssFile = path.join(paths.PUBLIC, 'css', 'styles.css');
    await fs.promises.mkdir(path.dirname(cssFile), {recursive: true});
    const cssStats = fs.lstatSync(cssFile);

    for (let file of scssFiles) {
      const stats = fs.lstatSync(file);
      if (stats.mtime > cssStats.ctime) {
        await cp.spawn(path.join(paths.SERVER, 'tasks', 'css-render.mjs'));
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
  const html = new Html({ styles: ['/css/styles.css'], });
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
  const apiFile = path.join(paths.SERVER, 'apis', path.relative('/api', ctx.pathname) + '.mjs');

  if (fs.existsSync(apiFile)) {
    return await import(apiFile).then(m => m.default).then(app => {
      app(ctx);
    });
  }

  ctx.type = 'html';
  const html = new Html({ styles: ['/css/styles.css'], });
  const md = new Remarkable({
    html: true,
  });

  html.body = '<div class="container markdown">' + 
    md.render(fs.readFileSync(path.join(paths.SERVER, 'apis', 'README.md'), 'utf8')) +
  '</div>';

  html.title = 'API数据服务';
  ctx.body = html.render();
});

routes.get('/*', 
  statics({ root: paths.PUBLIC }),
  serverRender({
    styles: [ "/css/styles.css" ],
    scripts: [
      { src: `/javascript/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
      { src: `/javascript/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
      { src: "/modules/main.mjs", module: true, crossorigin: true },
      { src: "/modules/fallback.js", nomodule: true},
    ],
  }), 
);

/**
 * 循环读取目录,返回文件路径列表
 *
 * @param {string} dir
 */

function readDir (dir) {
  let file_lists = []; // 文件列表
  
  if (Array.isArray(dir)) {
    for (let d of dir) file_lists = file_lists.concat(readDir(d));
  }

  if (typeof dir === 'string' && fs.existsSync(dir)) {

    const files = fs.readdirSync(dir, {withFileTypes: true});

    for (let file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isFile()) file_lists.push(filePath);
      if (file.isDirectory()) file_lists = file_lists.concat(readDir(filePath));
    }
  }

  return file_lists;
}
