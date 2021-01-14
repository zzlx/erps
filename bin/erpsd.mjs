#!/usr/bin/env node --trace-warnings

// 加载主程序
import main from '../src/backend/main.mjs';

// 获取执行参数列表
const ARGV = Array.prototype.slice.call(process.argv, 2);

// 传入执行参数ARGV, 执行主程序
main(ARGV);
