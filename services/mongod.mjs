/**
 * *****************************************************************************
 *
 * Mongodb Daemon
 * ================
 *
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import util from 'util';
const debug = util.debuglog('debug:mongod');

const Args = [
  `--dbpath=${config.paths.dataPath}`
].filter(Boolean).concat(argvs);

cp.spawn('mongod', Args, {
  //cwd: APP_ROOT,
  env: process.env,
  detached: true,
  stdio: ['ignore', 1, 2], 
});
