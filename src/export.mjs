/**
 * *****************************************************************************
 *
 * 用于生成目录index.mjs模块
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

let argvs = process.argv.slice(2);
const __filename = String(import.meta.url).substr(7);

if (process.cwd() === path.dirname(__filename)) {
	console.log('⚠️  禁止在当前目录执行此脚本程序.');
	process.exit();
}

function firstUpperCase(str) {
  return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

if (argvs.length === 0) {
  const realDir = process.cwd();
  if (fs.existsSync(realDir)) generateIndex(realDir);
}

// 遍历列表,执行任务
for (let dir of argvs) {
  // 获取目录绝对路径 
  const realDir = path.join(process.cwd(), dir);

  // 判断目录是否存在，如存在则为目录生成index.mjs模块
  if (fs.existsSync(realDir)) generateIndex(realDir);
}

function generateIndex (module_dir) {
  return fs.promises.readdir(module_dir, {withFileTypes: true}).then(files => {
    let retval = '';
    let module_count = 0;
    const dir_modules = [];

    // 遍历目录文件
    for (let file of files) {
      if (file.isDirectory()) {
        retval = `import * as ${file.name} from './${file.name}/index.mjs';` + os.EOL + retval;
        dir_modules.push(file.name);
      } else {
				// 处理例外事项
				if (!/\.mjs$/.test(file.name)) continue;
        if (file.name === 'index.mjs') continue;

        if (/\.mjs$/.test(file.name)) {
          const name = String(file.name).replace('.mjs', '');
          retval += `export { default as ${name} } from './${file.name}';` + os.EOL; 
        }

        if (/\.cjs$/.test(file.name)) {
          const name = String(file.name).replace('.cjs', '');
          retval += `export { ${name} } from './${file.name}';` + os.EOL; 
        }
      }
      module_count++;
    }

    if (dir_modules.length) {
      let dm = '';
      for (let m of dir_modules) {
        dm += `  ${m},` + os.EOL;
      }

      retval += `export {${os.EOL}${dm}}` + os.EOL; 
    }
    const name = path.basename(module_dir);
    retval = `/**
 * ${firstUpperCase(name)}
 * Modules is automatic exported by bin/index.mjs. (count: ${module_count})
 */` + os.EOL + retval;

    const index_file = path.join(module_dir, 'index.mjs');

		if (index_file === __filename) return; // 再次判断,防止被自己重写

    return fs.promises.writeFile(index_file, retval, {
      encoding: 'utf8', 
      mode: 0o755, 
      flag: 'w'
    }).then(() => {
			console.log('👏提示消息:');
			console.log(index_file, '文件已写入.');
		});
  }).catch(err => console.log(err));
}
