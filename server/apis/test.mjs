/**
 * *****************************************************************************
 * 
 * test
 *
 * *****************************************************************************
 */

import { Router } from '../koa/Router.mjs'; 


const router = new Router({ });

// get users from db
const users =  {
  1: 'zhang',
  2: 'wang',
  3: 'li',
  4: 'zhao'
};

router.get('/', async (ctx) => {
    ctx.type = 'html';
    ctx.body = '<h1>hello world!</h1>';
})
    .get("/users", async (ctx, next) => {
        ctx.body = '获取用户列表';
        return next();
    })
    .get("/users/:id", async (ctx, next) => {
        const { id } = ctx.params
        ctx.body = `获取id为${id}的用户`;
        return next();
    });

export default router;
