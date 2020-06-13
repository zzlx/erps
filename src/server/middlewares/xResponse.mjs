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

    // set x-powered-by header
		ctx.set('X-Powered-By', `Node.js@${process.version}`); 

    await next();

    if (ctx.app.env !== 'development') return;
    timer = process.hrtime(timer); // hrtime is an array like [s, ns]
    // count micro secont time 
    const interval = Math.round(timer[0] * 1000 + timer[1] / 1000000);
    ctx.set('X-Response-Time', `${interval}ms`); // set x-response-time header
  }
}
