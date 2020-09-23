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

import dba from '../../src/koas/middlewares/dba.mjs';
import statics from '../../src/koas/middlewares/statics.mjs';
import serverRender from '../../src/koas/middlewares/serverRender.mjs';
import Router from '../../src/koas/Router.mjs';

import settings from '../../src/config/settings.mjs';
import { date } from '../../src/utils/index.mjs';
import readDir from '../../src/utils/readDir.mjs';

import tasks from '../../server/tasks.mjs';

const __filename = import.meta.url.substr(7);
const debug = util.debuglog(`debug:${path.basename(__filename)}`); 
const paths = settings.paths;

const graphql = new Router({});

graphql.use(dba(settings));

graphql.all('graphql', '/graphql', async (ctx, next) => {
  //ctx.body = await ctx.getRawBody();
  //debug(ctx.params);
  //debug('ctx._matchedRoute', ctx._matchedRoute);
  //debug(ctx.router.url('graphql', 'tttt'));
  ctx.body = 'graphql';
});

// 定义主路由
const Index = new Router();

Index.use('/api', graphql.routes(), graphql.allowedMethods());

Index.get('/system/log', (ctx, next) => {
  ctx.type = 'text';
  const logFile = path.join(paths.HOME, 'log', date.format('yyyymmdd') + '.log');
  ctx.body = fs.createReadStream(logFile);
});

Index.all('/*', serverRender());

/**
 * 当发生样式文件修改时，自动重建styles.css文件
 */

Index.get('/*', async (ctx, next) => {
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
      debug(scssFiles);
      const cssStats = fs.lstatSync(path.join(paths.PUBLIC, 'styles', 'main.css'));

      for (let file of scssFiles) {
        const stats = fs.lstatSync(file);
        if (stats.mtime > cssStats.ctime) {
          await tasks.generateCSS();
          break;
        }
      }
    }
  }

  await next();
});

Index.get('/*', statics({ root: paths.PUBLIC }));

export default Index;
