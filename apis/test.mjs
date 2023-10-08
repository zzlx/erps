/**
 * *****************************************************************************
 * 
 * test
 *
 * *****************************************************************************
 */

// get users from db
const users =  {
  1: 'zhang',
  2: 'wang',
  3: 'li',
  4: 'zhao'
};

const test = function (ctx, next) {
  ctx.type = 'html';
  ctx.body = '<h1>hello world!</h1>';
};

export default test;
