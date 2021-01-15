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

import Main from '../src/backend/Main.mjs'; // 加载主程序

const main = new Main({
  argvs: Array.prototype.slice.call(process.argv, 2), // 获取并传递执行参数列表
});

main.run(); // 执行主程序
