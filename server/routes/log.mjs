/**
 * *****************************************************************************
 * 
 * log routes
 *
 * *****************************************************************************
 */

import settings from '../../src/settings.mjs';
import statics from '../../src/koa/middlewares/statics.mjs';
import Router from '../../src/koa/Router.mjs';
const router = new Router();
// @TODOS:读取log/request.log时,readStream无法关闭
router.get('log', '/log/*', statics(settings.paths.LOG_PATH, { prefix: '/log' }));

export default router.routes();
