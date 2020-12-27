/**
 * *****************************************************************************
 * 
 * Serverside routes 
 *
 * *****************************************************************************
 */

import path from 'path';

import Router from '../koa/Router.mjs';
import settings from '../settings/index.mjs';
import statics from '../koa/middlewares/statics.mjs';
import * as routes from './routes/index.mjs';

const router = new Router();
export default router;

//process.env.NODE_ENV === 'development' && router.use(routes.log);
//router.use('/api', routes.api);
//router.get('/', routes.homePage);
router.get('docs', ['/documentation', '/docs'], routes.docs);
router.get('public', '/*', statics(settings.paths.PUBLIC));
router.get('uis', '/assets/es/*', statics(path.join(settings.paths.SRC, 'uis'), { 
  prefix: '/assets/es/'
}));

router.get(['/*', '/homePage', '/index.html'], routes.homePage);
