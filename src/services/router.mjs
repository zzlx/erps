/**
 * *****************************************************************************
 * 
 * Routes 
 *
 * *****************************************************************************
 */

import path from 'path';

import Router from '../koa/Router.mjs';
import statics from '../koa/middlewares/statics.mjs';
import settings from '../settings/index.mjs';

import * as routes from './routes/index.mjs';

const router = new Router();

//process.env.NODE_ENV === 'development' && router.use(routes.log);
router.get('docs', ['/documentation', '/docs'], routes.docs);
router.get('public', '/*', statics(settings.paths.PUBLIC));
router.get('/assets/es/*', statics(path.join(settings.paths.SRC, 'webUI'), {
  prefix: '/assets/es/'
}));
router.get('/*', routes.homePage);

export default router;
