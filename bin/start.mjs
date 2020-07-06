#!/usr/bin/env node --no-warnings --experimental-json-modules
/**
 * *****************************************************************************
 *
 * start脚本
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import path from 'path';

const __dirname = path.dirname(import.meta.url).substr(7); // __dirname
const appRoot = path.dirname(__dirname);
const appPath = path.join(appRoot, 'src/server/main.mjs');

cp.spawn(appPath);
