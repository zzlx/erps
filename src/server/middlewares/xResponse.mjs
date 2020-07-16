/**
 * *****************************************************************************
 *
 * x-response middleware
 *
 * @return {function} middleware
 * @api public
 * *****************************************************************************
 */

import util from 'util';
const debug = util.debuglog('debug:middleware.x-response');

export default function (opts = {}) {
	return async function xResponseMiddleware (ctx, next) {
    let timer= process.hrtime(); // use process.uptime can be efficient

    await next();

    timer = process.hrtime(timer); // hrtime is an array like [s, ns]
    // count micro secont time 
    const interval = Math.round(timer[0] * 1000 + timer[1] / 1000000);

    ctx.set('X-Response-Time', `${interval}ms`);

    if (ctx.app.env !== 'production') {
      ctx.set('X-Environment', ctx.app.env);
      ctx.set('X-Powered-By', `${process.release.name}@${process.version}`); 
    }
  }
}
