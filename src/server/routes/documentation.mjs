/**
 * *****************************************************************************
 * 
 * 
 *
 * *****************************************************************************
 */

import settings from '../../settings.mjs';

import Router from '../../koa/Router.mjs';
import statics from '../../koa/middlewares/statics.mjs';

const router = new Router();

router.get('docs', '/*', statics(settings.paths.DOCS, {
  directoryIndex: [ 'README.md' ],
}));

export default router.routes();
export const allowedMethods = router.allowedMethods();
