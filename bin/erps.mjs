#!/usr/bin/env node
/**
 * *****************************************************************************
 * 
 * *****************************************************************************
 */

import main from '../src/main.mjs';
console.log(process.argv[0]);

// 获取并传递执行参数列表
// 执行主程序
main(Array.prototype.slice.call(process.argv, 2));
