/**
 * *****************************************************************************
 * 
 * api routes
 *
 * *****************************************************************************
 */

import path from 'path';
import settings from '../../settings/index.mjs';
import Router from '../../koa/Router.mjs';
const router = new Router(); // 路由配置

router.get('api', '/api*', (ctx, next) => {
  //console.log(ctx.router);
  //ctx.type = 'html';
  ctx.body = 'api';
  return next();
});

export default router.routes();
export const allowedMethods = router.allowedMethods();
