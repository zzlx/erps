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
