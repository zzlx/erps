#!/usr/bin/env node

/**
 * *****************************************************************************
 *
 * 生成目录index模块
 *
 * *****************************************************************************
 */

const fs = require('fs');
const path = require('path');

const argvs = Array.prototype.slice.call(process.argv, 2);
const dir = argvs[0]; 
const target = argvs[1];

if (dir == null) {
  console.error('Error: 请提供一个目录作为参数');
  process.exit(); }

fs.promises.readdir(dir, { encoding: 'utf8', withFileTypes: true }).then(files => {
  if (target == null && fs.existsSync(path.join(dir, 'index.mjs'))) {
    console.error(`index.mjs已存在，是否覆盖，请确认.`);
    return;
  }

  let retval = '';
  let count = 0;

  files.map(file => {
    if (file.isDirectory()) {
      retval = `import * as ${file.name} from './${file.name}/index.mjs';\n` + retval
      retval += `export { ${file.name} };\n`;
      count++;
    } else if (file.isFile()) { 
      if (file.name === 'index.mjs') return;
      if (/^\./.test(file.name)) return;
      if (!/.mjs$/.test(file.name)) return;

      const fileContent = fs.readFileSync

      retval += `export { ${path.basename(file.name, '.mjs')} } from './${file.name}';\n`;
      count++;
    }
  });

  retval = `/**
 * *****************************************************************************
 *
 * ${path.basename(dir)} modules
 *
 * 模块计数: ${count}
 * 模块说明: 此模块由工具自动生成
 * 生成时间: ${new Date().toLocaleString()}
 * *****************************************************************************
 */

` + retval;

  if (target == null) return console.log(retval);
  fs.writeFileSync(target, retval);
});
