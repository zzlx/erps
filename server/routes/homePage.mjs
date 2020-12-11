/**
 * *****************************************************************************
 * 
 * homePage
 * 
 *
 * *****************************************************************************
 */

import path from 'path';
import settings from '../../src/settings.mjs';

import Router from '../../src/koa/Router.mjs';
import serverRender from '../../src/koa/middlewares/serverRender.mjs';

const router = new Router();

router.get('index', '/*',  serverRender({ 
  app: path.join(settings.paths.FRONTEND, 'App.mjs'),
  template: settings.templates.HomePageHtml,
}));

export default router.routes();
export const allowedMethods = router.allowedMethods();
