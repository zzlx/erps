#!/usr/bin/env node --trace-warnings
/**
 * *****************************************************************************
 * 
 * ERP services daemon
 *
 * *****************************************************************************
 */

import main from '../src/backend/main.mjs';

// 执行后端主程序
main(Array.prototype.slice.call(process.argv, 2));
