/**
 * *****************************************************************************
 * 
 * routes
 *
 * *****************************************************************************
 */

import path from 'path';

import Router from './httpd/Router.mjs';
import statics from './httpd/middlewares/statics.mjs';
import settings from './settings/index.mjs';

import docs from './documentation.mjs';
import homePage from './homePage.mjs';
//import log from './log.mjs';

const router = new Router();

//process.env.NODE_ENV === 'development' && router.use(log);
//router.get('docs', ['/documentation', '/docs'], docs);
router.get('public', '/*', statics(settings.paths.PUBLIC));
router.get('/*', homePage);

export default router;
