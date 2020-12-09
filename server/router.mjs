/**
 * *****************************************************************************
 * 
 * 服务端路由配置
 *
 *
 * *****************************************************************************
 */

import path from 'path';
import settings from '../src/settings.mjs';
import Router from '../src/koa/Router.mjs';
import * as routes from './routes/index.mjs';

const router = new Router();
settings.isDevel && router.use(routes.log);
router.use('/documentation', routes.docs);
router.use('/api', routes.api);
router.use(routes.homePage);
export default router;
