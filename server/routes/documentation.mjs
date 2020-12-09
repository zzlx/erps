/**
 * *****************************************************************************
 * 
 * 
 *
 * *****************************************************************************
 */

import settings from '../../src/settings.mjs';

import Router from '../../src/koa/Router.mjs';
import statics from '../../src/koa/middlewares/statics.mjs';

const router = new Router();

router.get('docs', '/*', statics(settings.paths.DOCS, {
  directoryIndex: [ 'README.md' ],
}));

export default router.routes();
