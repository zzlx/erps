#!/usr/bin/env node
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
import settings from '../src/config/settings.mjs';

const debug = util.debuglog('debug:mongod');
const Args = [
  `--dbpath=${settings.paths.dataPath}`
].filter(Boolean).concat(argvs);

cp.spawn('mongod', Args, {
  //cwd: APP_ROOT,
  env: process.env,
  detached: true,
  stdio: ['ignore', 1, 2], 
});
