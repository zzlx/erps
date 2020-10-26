#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * 生成css文件
 *
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
const scssEntryPoint = path.join(paths.SRC, 'scss', 'main.scss');
const cssFile = path.join(paths.WWW_PATH, 'assets', 'css', 'styles.css');
const isDevel = process.env.NODE_ENV === 'developemnt' ? true : false;

// node-sass module
import('node-sass').then(m => new Promise((resolve, reject) => {
  const sass = m.default ? m.default : m;
  sass.render({
    file: scssEntryPoint,
    outputStyle: process.env.NODE_ENV === 'production' ? 'compressed': 'nested',
  }, async (err, result) => {
    if (err) reject(err);

    // 保证目标文件的目录已经准备就绪
    fs.mkdirSync(path.dirname(cssFile), {recursive: true}); 

    const tasks = Promise.all([
      fs.promises.writeFile(cssFile, result.css),
      !isDevel && fs.promises.writeFile(cssFile + '.br', zlib.deflateCompressSync(result.css)),
      !isDevel && fs.promises.writeFile(cssFile + '.br', zlib.brotliCompressSync(result.css)),
    ].fileter(Boolean));

    resolve(tasks);
  });
})).catch(err => console.error(err));
