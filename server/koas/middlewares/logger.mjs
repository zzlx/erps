/**
 * *****************************************************************************
 *
 * # 日志记录
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
import { date } from '../../utils.mjs';

const fmt = v => `0${v}`.substr(-2);
const sn = d => `${d.getFullYear()}${fmt(d.getMonth() + 1)}${fmt(d.getDate())}`; 

export default function logger (options = {}) {
  const opts = Object.assign({}, {
    path: process.cwd(),
  }, typeof options === 'string' ? {path: options} : options);

  let ws = null; // write stream 

  const getWS = file => {
    if (ws && ws.close === false) return ws;
    ws = fs.createWriteStream(file, {flags: 'a'}); 
    return ws;
  }

  return async function logMiddleware (ctx, next) {
    const log = { // 构造日志对象
      "time": date.toISOString(),
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
    };

    try {
      // 执行中间件栈
      await next(); 

      // 记录服务端响应信息
      log['status'] = ctx.status;
      log["res-time"] = ctx.response.headers['x-response-time'];

    } catch (error) {
      Promise.reject(error);
    }

    if (ctx.state.noLog) return;

    const logFile = path.join(opts.path, 'request.log');

    await archiveFile(logFile); // 存档日志

    if (!fs.existsSync(logFile)) {
      ws.end();

      // 创建不存在的日志文件
      getWS(logFile);

      // 写入日志文件格式说明及字段对应名称
      ws.write('# 格式说明: 字段采用Tab符号分隔,每条记录占据一行.\n');
      ws.write(Object.keys(log).join('\t') + '\n');
    }

    getWS(logFile);
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
