/**
 * *****************************************************************************
 * 
 * 服务端路由配置
 *
 * *****************************************************************************
 */

import path from 'path';
import settings from '../src/settings.mjs';
import Router from '../src/koa/Router.mjs';

import index from './routes/index.mjs';
import api from './routes/api.mjs';
import log from './routes/log.mjs';

const router = new Router();
settings.isDevel && router.use(log.routes());
router.use(api.routes());
router.use(index.routes());

export default router;
