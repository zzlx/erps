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

const fmt = v => `0${v}`.substr(-2);
const sn = d => `${d.getFullYear()}${fmt(d.getMonth() + 1)}${fmt(d.getDate())}`; 
const wsMap = new Map();
const getWS = file => {
  let ws = wsMap.get(file);
  if (ws && ws.closed !==false) return ws;
  ws = fs.createWriteStream(file, {flags: 'a', autoClose: true});
  wsMap.set(file, ws);

  return ws;
}

/**
 * 日志记录器
 */

export default function logWriter (file, log) {
  let content = '';
  let header = '';
  if ('object' === typeof log) {
    content = Object.values(log).join('\t') + '\n';
    header = Object.keys(log).join('\t') + '\n';
  }

  if ('string' === typeof log) content = log;

  if (!fs.existsSync(file)) getWS(file).write(header);
  const fileSN = sn(new Date(fs.lstatSync(file).birthtime));
  const nowSN = sn(new Date());

  if (fileSN !== nowSN) {
    const dirname = path.dirname(file);
    const extname = path.extname(file);
    const basename = path.basename(file, extname);
    const bakFile = path.join(dirname, basename + "_" + fileSN + extname);
    fs.copyFileSync(file, bakFile);
    fs.unlinkSync(file);
    getWS(file).write(header);
  }

  getWS(file).write(content);
}
