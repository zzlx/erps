/**
 * *****************************************************************************
 *
 * # 日志中间件
 *
 * 构造日志对象,为服务器提供日志记录
 *
 * @param {function} callback 将日志对象交给callback处理
 * @return {function} middleware
 * @api public
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const fmt = v => `0${v}`.substr(-2);
const sn = d => `${d.getFullYear()}${fmt(d.getMonth() + 1)}${fmt(d.getDate())}`; 

export default function log (options = {}) {
  let opts = { path: process.cwd() };
  if (typeof options === 'string') opts.path = options;

  let ws = null; // write stream 
  const createWS = (file) => ws = fs.createWriteStream(file, {flags: 'a'}); 

  return async function logMiddleware (ctx, next) {
    // 记录访问日志信息
    const log = {
      "time": new Date(),
      "c-ip": ctx.socket.remoteAddress,
      "c-port": ctx.socket.remotePort,
      "user-agent": ctx.get("user-agent"),
      "referer": ctx.get("referer"),
      "method": ctx.method,
      "url": ctx.href,
      "s-ip": ctx.socket.localAddress,
      "s-port": ctx.socket.localPort,
      "s-pid": process.pid,
      "status": null,
      "res-time": null,
      "errors": '',
    };

    try {
      // 执行中间件栈
      await next(); 

      // 记录服务端响应信息
      log['status'] = ctx.status;
      log["res-time"] = ctx.response.headers['x-response-time'];
      log["errors"] = ctx.state.errors.join('|');

    } catch (error) {
      log["errors"] = log['errors'] + error.message;
      ctx.state.errors.push(error.message); // store error
      Promise.reject(error); // reject error
    }

    if (ctx.state.noLog) return;

    const logFile = path.join(opts.path, 'request.log');

    await archiveFile(logFile); // 存档日志

    if (!fs.existsSync(logFile)) {
      createWS(logFile);
      ws.write(Object.keys(log).join('\t') + '\n');
    }

    if (ws == null) createWS(logFile); 
    if (ws && ws.close) createWS(logFile);

    ws.write(Object.values(log).join('\t') + '\n');
  } 
}

// 按日期存档文件
function archiveFile (file) {
  if (!fs.existsSync(file)) return Promise.resolve(false);

  const fileSN = sn(new Date(fs.lstatSync(file).birthtime));
  const nowSN = sn(new Date());
  if (fileSN === nowSN) return Promise.resolve(false);

  return Promise.all([
    fs.promises.writeFile(
      path.join(path.dirname(file), fileSN + '_' + path.basename(file) + '.br'),
      zlib.brotliCompressSync(fs.readFileSync(file))
    ),
    fs.promises.unlink(file),
  ]);
} 
