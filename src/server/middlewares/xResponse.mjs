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

export default function () {
	return async function xResponseMiddleware (ctx, next) {
    // 在不要求精确记录时间差的时,使用process.uptime()效率高
    let timer= process.hrtime(); 

    await next(); // 等待next执行完毕

    timer = process.hrtime(timer); // 获取一个精确的时间戳对象:[秒,纳秒]
    // 计算耗时,将时间戳对象转换为毫秒
    const interval = Math.round(timer[0] * 1000 + timer[1] / 1000000);
    ctx.set('X-Response-Time', `${interval}ms`); // 设置响应时间

		// 设置x-powered-by
		ctx.set('X-Powered-By', `Node.js@${process.version}`);
  }
}
