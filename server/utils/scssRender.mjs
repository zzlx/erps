/**
 * *****************************************************************************
 *
 * 生成CSS文件
 *
 * @todo: 放入API,重新渲染样式文件由后台管理端进行管理
 * 需要重新渲染时,向服务端口发送重新渲染API请求
 *
 * *****************************************************************************
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";
import util from "util";

import { paths, } from "../settings/index.mjs";
import { readDir } from "../utils/readDir.mjs";

const debug = util.debuglog(`debug:${import.meta.url.substr(7)}`);

export async function scssRender () {
	const cssFile = path.join(paths.PUBLIC_HTML, 'statics', "stylesheets", "styles.css");
  const scssFile = path.join(paths.SRC, "scss", "main.scss");

  // 比对cssFile与scssFile所在目录所有文件时间戳
  // 决定是否需要执行CSS文件渲染程序
 
  const cssStat = await fs.promises.stat(cssFile).catch(() => {});
  const files = readDir(path.dirname(scssFile));
  let reRender = !cssStat;

  if (reRender === false) {
    for (const file of files) {
      if (fs.statSync(file).mtime > cssStat.mtime) {
        reRender = true;
        break;
      }
    }
  }

  reRender && render(scssFile).then(css => {
    fs.mkdirSync(path.dirname(cssFile), { recursive: true });

    return Promise.all([
      fs.promises.writeFile(cssFile, css),
      fs.promises.writeFile(cssFile + ".gz", zlib.gzipSync(css)),
      fs.promises.writeFile(cssFile + ".br", zlib.brotliCompressSync(css)),
      fs.promises.writeFile(cssFile + ".deflate", zlib.deflateSync(css)),
    ]).then(() => {
      debug("SCSS样已重新渲染.");
    });
  }).catch(debug);
}

/**
 * Scss编译生成CSS
 *
 * 用于从src/scss目录生成css文件
 *
 * [参考文档](../node_modules/sass/README.md)
 * [node-sass](https://github.com/sass/node-sass)
 */

export async function render (scssFile) {
  const sass = await import("sass").then(m => m.default);
  const format = process.env.NODE_ENV === "development" ? "expanded" : "compressed";

  return new Promise((resolve, reject) => {
    sass.render({ file: scssFile, outputStyle: format, }, (err, result) => {
      if (err) reject(err);
      resolve(result.css);
    });
  });
}
