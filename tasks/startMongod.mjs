#!/usr/bin/env node

import cp from 'child-process';
import config from '../config/default.mjs';

const Args = [
  `--dbpath=${config.paths.dataPath}`
].filter(Boolean).concat(argvs);

cp.spawn('mongod', Args, {
  //cwd: APP_ROOT,
  env: process.env,
  detached: true,
  stdio: ['ignore', 1, 2], 
});
