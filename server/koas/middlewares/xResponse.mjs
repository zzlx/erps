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

export default function xResponse(opts = {}) {
	return async function xResponseMiddleware (ctx, next) {
    let timer= process.hrtime(); // use process.uptime can be efficient
    //const start = Date.now();

    await next();

    if (ctx.app.env !== 'production') {
      timer = process.hrtime(timer); // hrtime is an array like [s, ns]

      // count micro secont time 
      const interval = Math.round(timer[0] * 1000 + timer[1] / 1000000);
      //const ms = Date.now() - start;

      const platform = `${os.platform()}_${os.arch()}`;
      const nodejs = `${process.release.name}@${process.version}`; 

      ctx.set({
        'X-Response-Time': `${interval}ms`,
        'X-Powered-By': `${nodejs} (${platform})`,
      });
    }

  }
}
