/**
 * *****************************************************************************
 *
 * X-response middleware
 *
 * * 记录中间件处理请求的响应时间
 * * 显示服务信息
 *
 * @param {string|object} format
 * @return {function} middleware
 * @api public
 *
 * *****************************************************************************
 */

import os from 'os';
import util from 'util';

const debug = util.debuglog('debug:x-response-middleware');

export default function xResponse(opts = {}) {

	return async function xResponseMiddleware (ctx, next) {
    let timer= process.hrtime(); // use process.uptime can be efficient

    await next();

    timer = process.hrtime(timer); // hrtime is an array like [s, ns]

    // count micro secont time 
    const interval = Math.round(timer[0] * 1000 + timer[1] / 1000000);

    ctx.set('X-Response-Time', `${interval}ms`);

    if (ctx.app.env !== 'production') {
      const platform = `${os.platform()}_${os.arch()}`;
      const nodejs = `${process.release.name}@${process.version}`; 

      ctx.set('X-Powered-By', `${nodejs} (${platform})`); 
    }
  }
}
