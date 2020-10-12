#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * 拷贝UMD模块至public/javascript目录
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import settings from '../config/settings.mjs';

// 定义样式文件路径
const paths = settings.paths; // 获取目录配置
const destPath = path.join(paths.PUBLIC, 'javascript');
fs.mkdirSync(destPath, {recursive: true});

// 执行拷贝任务
Promise.all(
  [ // source files
    path.join('react', 'umd', 'react.development.js'),
    path.join('react', 'umd', 'react.production.min.js'),
    path.join('react-dom', 'umd', 'react-dom.development.js'),
    path.join('react-dom', 'umd', 'react-dom.production.min.js'),
  ]
  .map(src => path.join(paths.NODE_MODULES, src))
  .map(src => fs.promises.copyFile(
    src, 
    path.join(destPath, path.basename(src)), 
  ))
).catch(err => console.error(err));
