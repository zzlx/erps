/**
 * *****************************************************************************
 *
 * 拷贝文件
 *
 * @todo: 放入API,重新拷贝js文件由后台管理端进行管理
 *
 * *****************************************************************************
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";
import { paths } from '../settings/paths.mjs';

export function copyJS (files = []) {

  return Promise.all(files.map(file => {

    if (!fs.existsSync(file)) throw new Error(`${file} is not exist!`);

    const destFile = path.join(paths.PUBLIC_HTML, 'statics', "js", path.basename(file));

    if (!fs.existsSync(destFile) ||
      (fs.existsSync(destFile) && fs.statSync(destFile).mtime < fs.statSync(file).mtime)) {
      copyFile(file, destFile, true);
    }
  })).catch(console.error);

}

export function copyFile (src, dest, compress = false) {
  const destPath = path.dirname(dest);
  return fs.promises.mkdir(destPath, { recursive: true }).then(() =>
    fs.promises.cp(src, dest, { preserveTimestamps: true }).then(() =>
      compress && compressFile(dest)
    )
  );
}

export function compressFile (file) {
  return fs.promises.writeFile(
    file + ".br",
    zlib.brotliCompressSync(fs.readFileSync(file))
  );
}
