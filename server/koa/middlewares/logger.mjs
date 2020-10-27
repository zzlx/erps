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
import util from 'util';
import { date } from '../../utils.lib.mjs';

const debug = util.debuglog('debug:logger.mjs');

const fmt = v => `0${v}`.substr(-2);
const sn = d => `${d.getFullYear()}${fmt(d.getMonth() + 1)}${fmt(d.getDate())}`; 

export default function logger (options = {}) {
  const opts = Object.assign({}, {
    path: process.cwd(),
  }, typeof options === 'string' ? {path: options} : options);

  const logFile = path.join(opts.path, 'request.log');

  return async function logMiddleware (ctx, next) {
    ctx.state.log = {
      "datetime": date.toISOString(),
      "c-address": ctx.socket.remoteAddress,
      "c-port": ctx.socket.remotePort,
      "user-agent": ctx.get("user-agent"),
      "method": ctx.method,
      "href": ctx.href,
      "status": null,
      "referer": ctx.get("referer"),
      "s-address": ctx.socket.localAddress,
      "s-port": ctx.socket.localPort,
      "s-pid": process.pid,
    };

    await next(); // 执行中间件栈

    ctx.state.log['status'] = ctx.status;
    if (ctx.state.noLog) return; // 记录request log
    logWriter(logFile, ctx.state.log);
  } 
}

/**
 *
 *
 */

const wsMap = new Map();

const getWS = file => {
  let ws = wsMap.get(file);
  if (ws && ws.closed !==false) return ws;
  ws = fs.createWriteStream(file, {flags: 'a', autoClose: false});
  wsMap.set(file, ws);

  return ws;
}

/**
 * 日志记录器
 */

export function logWriter (file, log) {
  if (!fs.existsSync(file)) getWS(file).write(Object.keys(log).join('\t') + '\n');
  const fileSN = sn(new Date(fs.lstatSync(file).birthtime));
  const nowSN = sn(new Date());

  if (fileSN !== nowSN) {
    const bakFile = path.join(path.dirname(file), fileSN + "_" + path.basename(file));
    fs.copyFileSync(file, bakFile);
    fs.unlinkSync(file);
    getWS(file).write(Object.keys(ctx.state.log).join('\t') + '\n');
  }

  getWS(file).write(Object.values(log).join('\t') + '\n');
}
