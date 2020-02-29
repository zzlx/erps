/**
 * *****************************************************************************
 *
 * commit and push
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import { APP_ROOT } from './config.mjs';

process.stdout.write('准备提交变更...')
console.log('暂存变更...');
cp.execSync(`git -C ${APP_ROOT} add -A .`, {encoding: 'utf8'});

console.log('检查变更...');

//const diff = execSync(`git -C ${APP_ROOT} diff --staged --quiet`, { encoding: 'utf8', });

console.log('提交变更...');
cp.execSync(`git -C ${APP_ROOT} commit -m "自动提交"`, {encoding: 'utf8'});

console.log('同步远程仓库...');
