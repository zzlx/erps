/**
 * *****************************************************************************
 *
 * Scss编译生成CSS
 *
 * [参考文档](../../node_modules/node-sass/README.md)
 * [node-sass](https://github.com/sass/node-sass)
 *
 * @param {} scssFile
 * @param {function} cb 
 *
 *
 * *****************************************************************************
 */

import sass 'sass';

export default function scssRender (scssFile, cb) {
  const options = {
    file: scssFile,
    outputStyle: process.env.NODE_ENV === 'development' ? 'expanded' : 'compressed',
  };

  if (cb) return sass.render(options, cb);

  return new Promise((resolve, reject) => {
    sass.render(options, (err, result) => { 
      if (err) reject(err);
      resolve(result);
    });
  });
}
/*
 *
function cssRender () {
  const cssFile = path.join(
    settings.paths.PUBLIC, 
    'assets', 
    'css', 
    path.basename(scssEntryPoint, '.scss') + '.css',
  );
  const cssFileDeflate = cssFile + '.deflate';
  const cssFileBr = cssFile + '.br';
  const cssFileGz = cssFile + '.gz';

  // 保证目标文件的目录已经准备就绪
  fs.mkdirSync(path.dirname(cssFile), {recursive: true}); 
  const tasks = Promise.all([
    fs.promises.writeFile(cssFile, result.css),
    fs.promises.writeFile(cssFileGz, zlib.gzipSync(result.css)),
    fs.promises.writeFile(cssFileBr, zlib.brotliCompressSync(result.css)),
    fs.promises.writeFile(cssFileDeflate, zlib.deflateSync(result.css)),
  ].filter(Boolean));
}
*/
