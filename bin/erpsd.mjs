#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * ERPSD(ERP Services Daemon)
 *
 * 管理ERP服务
 *
 * 启动ERP服务
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import path from 'path';
import argvParser from './utils/argvParser.mjs';

const __dirname = path.dirname(import.meta.url).substr(7); // __dirname
const appRoot = path.dirname(__dirname);

const appPath = path.join(appRoot, 'src/server/main.mjs');
cp.spawn(appPath);
