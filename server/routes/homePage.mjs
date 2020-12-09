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
router.get('uis', '/assets/es/*', statics(settings.paths.UIS, { 
  prefix: '/assets/es/'
}));

router.get('index', '/*',  serverRender({ 
  app: path.join(settings.paths.UIS, 'App.mjs'),
  template: settings.templates.HomePageHtml,
}));

export default router.routes();
