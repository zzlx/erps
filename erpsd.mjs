#!/usr/bin/env node --trace-warnings
/**
 * *****************************************************************************
 * 
 * ERP services
 *
 * 实例化主控制程序
 *
 * *****************************************************************************
 */

import Main from './src/Main.mjs'; // 加载主程序

// 实例化主控程序
const main = new Main();

// 获取并传递执行参数列表
// 执行主程序
main.run(Array.prototype.slice.call(process.argv, 2));
