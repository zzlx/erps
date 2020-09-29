/**
 * *****************************************************************************
 *
 * 服务器端路由配置
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';

import ReactDOMServer from 'react-dom/server.js';

import dba from '../src/koas/middlewares/dba.mjs';
import serverRender from '../src/koas/middlewares/serverRender.mjs';
import statics from '../src/koas/middlewares/statics.mjs';
import Router from '../src/koas/Router.mjs';

import settings from '../src/settings.mjs';
import { date } from '../src/utils.mjs';
import readDir from '../src/utils/readDir.mjs';

const __filename = import.meta.url.substr(7);
const debug = util.debuglog(`debug:${path.basename(__filename)}`); 
const paths = settings.paths;
const index = new Router({});
const api = new Router({});

api.all('/', async (ctx, next) => {
  const apiFile = path.join(paths.API, ctx.path.replace(/^\/api\//, '') + '.mjs');

  if (fs.existsSync(apiFile)) {
    return await import(apiFile).then(m => {
      const api = m.default;
      api(ctx);
    });
  }

  ctx.body = 'api';
});

/**
 * 当发生样式文件修改时，自动重建styles.css文件
 */

/*
index.get('/*', async (ctx, next) => {

  if (ctx.path === '/statics/react-dom.development.js' ||
      ctx.path === '/statics/react-dom.production.min.js') {
    if (!fs.existsSync(path.join(paths.PUBLIC, ctx.path))) {
      const s = path.join(paths.NODE_MODULES, 'react-dom', 'umd', path.basename(ctx.path));
      const o = path.join(paths.PUBLIC, ctx.path);
      if (fs.existsSync(s)) await fs.promises.copyFile(s, o);
    }
  }

  if (ctx.path === '/statics/react.development.js' ||
      ctx.path === '/statics/react.production.min.js') {
    if (!fs.existsSync(path.join(paths.PUBLIC, ctx.path))) {
      const s = path.join(paths.NODE_MODULES, 'react', 'umd', path.basename(ctx.path));
      const o = path.join(paths.PUBLIC, ctx.path);
      if (fs.existsSync(s)) await fs.promises.copyFile(s, o);
    }
  }

  if (ctx.app.env === 'development') {
    if (ctx.path === '/styles/main.css') {
      const scssFiles = readDir(path.join(paths.PUBLIC, 'styles', 'scss')); 
      const cssFile = path.join(paths.PUBLIC, 'styles', 'main.css');
      const cssStats = fs.lstatSync(cssFile);

      for (let file of scssFiles) {
        const stats = fs.lstatSync(file);
        if (stats.mtime > cssStats.ctime) {
          // @todo: 
          break;
        }
      }
    }
  }

  await next();

});
*/

// 将api路由附加至index
index.use('/api*', api.routes(), api.allowedMethods());

/*
index.get('/*', serverRender({
  styles: [ "/styles/main.css" ],
  scripts: [
    { src: `/statics/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
    { src: `/statics/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
    { src: "/modules/main.mjs", module: true, crossorigin: true },
    { src: "/modules/fallback.js", nomodule: true},
  ],
}));
*/

// 
index.get('/*', statics({ root: paths.PUBLIC }));

export default index;
