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
import settings from '../src/settings/index.mjs';

// 定义样式文件路径
const paths = settings.paths; // 获取目录配置

console.log(paths.WWW_PATH);
const ftpServer = '';
const path = '/WEB';
const user = null;
const passwd = '';
cp.execSync(`curl ftp://${ftpServer}${path} -u "${user}:${passwd}");

export default class FtpClient {

}
