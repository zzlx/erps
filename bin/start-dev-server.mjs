#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 *
 * 用于开发环境下服务器管理
 *
 * * 监听源代码变动,重启服务器
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

process.env.NODE_ENV = 'development'; // set development environment

let sub_process = null;

const store = {
} 

const __dirname = path.dirname(import.meta.url).substr(7); // __dirname
const appRoot = path.dirname(__dirname);
const srcDir = path.join(appRoot, 'src');
const mainApp = path.join(appRoot, 'src', 'server', 'main.mjs');

let changed = false;

const shasum = (filePath) => new Promise((resolve, reject) => {
  fs.createReadStream(filePath).pipe(crypto.createHash('sha1')).on('readable', function () {
    let chunk;
    while (chunk = this.read()) {
      const sha1 = chunk.toString('hex');
      resolve(sha1);
    }
  });
});

async function readdir (dir) {
  await fs.promises.readdir(dir, {withFileTypes: true}).then(files => {
    files.forEach(async function (file) {
      if (file.isFile()) {
        const filePath = path.join(dir, file.name);

        await shasum(filePath).then(c => {
          if (store[filePath] && store[filePath] !== c) {
            changed = true;
          }

          store[filePath] = c;
        });
      }

      if (file.isDirectory()) await readdir(path.join(dir, file.name));
    });
  });
}

sub_process = cp.spawn(mainApp, ['--start'],{ stdio: 'inherit', });

const interval = setInterval(() => {
  readdir(srcDir).then(() => {
    if (changed == true) {
      sub_process.kill('SIGHUP');

      sub_process = cp.spawn(mainApp, ['--restart'], { stdio: 'inherit', });
      changed = false;
    }
  });
}, 3000);

process.on('beforeExit', () => {
  clearInterval(interval);
});
