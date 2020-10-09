/**
 * *****************************************************************************
 *
 * API路由
 *
 * 提供API服务
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';

import marked from 'marked';

import Router from '../koas/Router.mjs';
import settings from '../config/settings.mjs';
import Html from '../templates/Html.mjs';


const debug = util.debuglog('debug:api');
const api = new Router({});
const paths = settings.paths;

api.all('/', async (ctx) => {
  //if (ctx.pathname === 'favicon.ico') return await next();
  const apiFile = path.join(paths.SERVER, path.relative('/', ctx.pathname) + '.mjs');

  if (fs.existsSync(apiFile)) {
    return await import(apiFile).then(m => m.default).then(app => {
      app(ctx);
      debug(ctx.body);
    });
  }

  ctx.type = 'html';
  const html = new Html({
    styles: ['/styles/main.css'],
  });

  html.body = '<div class="container">' + 
    marked(fs.readFileSync(path.join(paths.SERVER, 'api', 'README.md'), 'utf8')) +
  '</div>';
  ctx.body = html.render();
});

export default api;
