/**
 * *****************************************************************************
 * 
 * 
 *
 * *****************************************************************************
 */

import path from 'path';
import settings from '../../src/settings.mjs';

import Router from '../../src/koa/Router.mjs';
import statics from '../../src/koa/middlewares/statics.mjs';
import serverRender from '../../src/koa/middlewares/serverRender.mjs';

const router = new Router();

router.get('public', '/*', statics(settings.paths.PUBLIC));

router.get('index', '/*',  serverRender({ 
  app: path.join(settings.paths.PUBLIC, 'assets', 'es', 'App.mjs'),
  template: settings.templates.HomePageHtml,
}));

export default router.routes();
