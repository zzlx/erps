#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * 拷贝UMD模块至public/javascript目录
 *
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import settings from '../src/settings.mjs';

// 定义样式文件路径
const paths = settings.paths; // 获取目录配置

console.log(paths.WWW_PATH);
cp.execSync(`cp -pPR ${paths.PUBLIC}/. ${paths.WWW_PATH}`);
