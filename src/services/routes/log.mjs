/**
 * *****************************************************************************
 * 
 * log routes
 *
 * *****************************************************************************
 */

import settings from '../../settings/index.mjs';
import statics from '../koa/middlewares/statics.mjs';
import Router from '../koa/Router.mjs';
const router = new Router();
// @TODOS:读取log/request.log时,readStream无法关闭
router.get('log', '/log/*', statics(settings.paths.LOG_PATH, { prefix: '/log' }));

export default router.routes();
export const allowedMethods = router.allowedMethods();
