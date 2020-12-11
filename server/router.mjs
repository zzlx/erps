/**
 * *****************************************************************************
 * 
 * Serverside routes 
 *
 * *****************************************************************************
 */

import Router from '../src/koa/Router.mjs';
import settings from '../src/settings.mjs';
import statics from '../src/koa/middlewares/statics.mjs';
import * as routes from './routes/index.mjs';

const router = new Router();
export default router;

//process.env.NODE_ENV === 'development' && router.use(routes.log);
//router.use('/api', routes.api);
//router.get('/', routes.homePage);
router.get('docs', ['/documentation', '/docs'], routes.docs);
router.get('public', '/*', statics(settings.paths.PUBLIC));
router.get('frontend', '/assets/es/*', statics(settings.paths.FRONTEND, { 
  prefix: '/assets/es/'
}));

router.get('/ttt/:name', (ctx, next) => {
  ctx.body = 'test';
  console.log(ctx.params);
});

router.get(/test\/(\w+)(?:[_-](\w+))?$/, (ctx, next) => {
  ctx.body = 'test';
  console.log(ctx.params);
});

router.get(['/', '/homePage', '/index.html'], routes.homePage);
