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

import tasks from '../../tasks/lists.mjs';
import dba from '../koa/middlewares/dba.mjs';
import statics from '../koa/middlewares/statics.mjs';
import serverRender from '../koa/middlewares/serverRender.mjs';

import Router from '../koa/Router.mjs';
import config from '../../config/default.mjs';
import { date } from '../utils.mjs';
import readDir from '../utils/readDir.mjs';

const __filename = import.meta.url.substr(7);
const debug = util.debuglog(`debug:${path.basename(__filename)}`); 
const paths = config.paths;

const graphql = new Router({});

graphql.use(dba(config));

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

Index.get('/test', (ctx, next) => {
  //ctx.body = fs.readDirSync()
  ctx.body = 'test1';

});

Index.get('/system/log', (ctx, next) => {
  const logFile = path.join(paths.logPath, date.format('yyyymmdd') + '.log');

  // @todos: 需要完善显示页面
  ctx.type = 'text';
  ctx.body = fs.createReadStream(logFile);
});

Index.all('/*', serverRender());

/**
 * 当发生样式文件修改时，自动重建styles.css文件
 */

Index.get('/*', async (ctx, next) => {
  if (ctx.path === '/statics/react-dom.development.js' ||
      ctx.path === '/statics/react-dom.production.min.js') {
    if (!fs.existsSync(path.join(paths.public, ctx.path))) {
      const s = path.join(paths.nodeModules, 'react-dom', 'umd', path.basename(ctx.path));
      const o = path.join(paths.public, ctx.path);
      if (fs.existsSync(s)) await fs.promises.copyFile(s, o);
    }
  }

  if (ctx.path === '/statics/react.development.js' ||
      ctx.path === '/statics/react.production.min.js') {
    if (!fs.existsSync(path.join(paths.public, ctx.path))) {
      const s = path.join(paths.nodeModules, 'react', 'umd', path.basename(ctx.path));
      const o = path.join(paths.public, ctx.path);
      if (fs.existsSync(s)) await fs.promises.copyFile(s, o);
    }
  }

  if (ctx.app.env === 'development') {
    if (ctx.path === '/statics/styles.css') {
      const scssFiles = readDir(paths.scssPath); 
      const cssStats = fs.lstatSync(paths.cssFile);

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

Index.get('/*', statics({
  root: paths.public,
}));

export default Index;
