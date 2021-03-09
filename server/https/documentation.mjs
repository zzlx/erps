/**
 * *****************************************************************************
 * 
 * 
 *
 * *****************************************************************************
 */

import settings from '../settings/index.mjs';

import Router from './Router.mjs';
import statics from './middlewares/statics.mjs';

const router = new Router();

router.get('docs', '/*', statics(settings.paths.DOCS, {
  directoryIndex: [ 'README.md' ],
}));

export default router.routes();
export const allowedMethods = router.allowedMethods();
