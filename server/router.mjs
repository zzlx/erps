/**
 * *****************************************************************************
 * 
 * 服务端路由配置
 *
 *
 * *****************************************************************************
 */

import Router from '../src/koa/Router.mjs';
import settings from '../src/settings.mjs';
import * as routes from './routes/index.mjs';

const router = new Router();
process.env.NODE_ENV === 'development' && router.use(routes.log);
router.use(['/documentation', '/docs'], routes.docs);
router.use('/api', routes.api);
router.use(routes.homePage);
export default router;
