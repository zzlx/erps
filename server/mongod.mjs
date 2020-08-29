/**
 * *****************************************************************************
 *
 * MongoDB Daemon
 * ===============
 *
 * 管理mongod服务
 *
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import os from 'os';
import { assert } from './utils.mjs';
import config from './config/default.mjs';

const __filename = import.meta.url.substr(7);
const debug = util.debuglog(`debug:${path.basename(__filename)}`);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const argvs = Array.prototype.slice.call(process.argv, 2);

startMongod();

/**
 * 工具函数
 *
 */

function startMongod () {
  const Args = [
    `--dbpath=${config.paths.dataPath}`
  ].filter(Boolean).concat(argvs);

  const mongod_process = cp.spawn('mongod', Args, {
    //cwd: APP_ROOT,
    env: process.env,
    detached: true,
    stdio: ['ignore', 1, 2], 
  });

  return mongod_process;
}

function detectMongod () {
}

function detectPlatform () {
  const p = new Map([
    ['aix', 'unix'], 
    ['darwin', 'unix'], 
    ['freebsd', 'unix'],
    ['linux', 'unix'], 
    ['openbsd', 'unix'], 
    ['sunos', 'unix'], 
    ['win32', 'win'],
    ['win64', 'win'],
  ]);

  const platform = os.platform();

  assert(p.has(platform), 'Unknown os platform.')

  return p.get(platform);
}
