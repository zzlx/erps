/**
 * x-response中间件: 用于记录请求相应时间
 *
 * @return {function} middleware
 * @api public
 */

export default function () {
    return async function xResponseMiddleware (ctx, next) {

        // 在不要求精确记录时间差的时,使用process.uptime()效率高
        let timer= process.hrtime(); 

        await next();

        // 获取一个精确的时间戳对象:[秒,纳秒]
        timer = process.hrtime(timer); 

        // 将时间戳对象转换为毫秒
        const interval = Math.round(timer[0] * 1000 + timer[1] / 1000000);
        ctx.set('X-Response-Time', `${interval}ms`);
    }
}
