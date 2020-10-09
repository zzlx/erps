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

import Router from './koas/Router.mjs';
import serverRender from './koas/middlewares/serverRender.mjs';
import statics from './koas/middlewares/statics.mjs';

import settings from './config/settings.mjs';
import readDir from './utils/readDir.mjs';
import api from './apis/index.mjs';

const debug = util.debuglog('debug:routes.mjs');
const paths = settings.paths;
const index = new Router({});

/**
 * 当发生样式文件修改时，自动重建styles.css文件
 */

index.get('/*', async (ctx, next) => {
  const pathname = ctx.pathname;

  if (pathname === '/statics/js/react-dom.development.js' ||
      pathname === '/statics/js/react-dom.production.min.js') {
    if (!fs.existsSync(path.join(paths.PUBLIC, pathname))) {
      const s = path.join(paths.NODE_MODULES, 'react-dom', 'umd', path.basename(pathname));
      const o = path.join(paths.PUBLIC, pathname);
      if (fs.existsSync(s)) await fs.promises.copyFile(s, o);
    }
  }

  if (pathname === '/statics/js/react.development.js' ||
      pathname === '/statics/js/react.production.min.js') {
    if (!fs.existsSync(path.join(paths.PUBLIC, pathname))) {
      const s = path.join(paths.NODE_MODULES, 'react', 'umd', path.basename(pathname));
      const o = path.join(paths.PUBLIC, pathname);
      if (fs.existsSync(s)) await fs.promises.copyFile(s, o);
    }
  }

  if (pathname === '/statics/css/styles.css') {
    const scssFiles = readDir(paths.SCSS);
    const cssFile = path.join(paths.PUBLIC, 'statics', 'css', 'styles.css');
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

// 将api路由附加至index
index.use('/api*', api.routes());

index.get('/*', serverRender({
  styles: [ "/statics/css/styles.css" ],
  scripts: [
    { src: `/statics/js/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
    { src: `/statics/js/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
    { src: "/modules/main.mjs", module: true, crossorigin: true },
    { src: "/modules/fallback.js", nomodule: true},
  ],
}));

index.get('/*', statics({ root: paths.PUBLIC }));

export default index;
