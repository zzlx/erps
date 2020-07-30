/**
 * *****************************************************************************
 *
 * styles
 *
 * @param {string} options.outputStyle default 'nested'
 *     nested, expanded, compact, compressed
 *
 *
 * *****************************************************************************
 */

import sass from 'node-sass';

export default function sassStyles (options = {}) {

  if (typeof options == 'string') options = {
    file: options,
  }

  const opts = Object.assign({}, {
    file: null, 
    outputStyle: 'nested',
  }, options); 

  return new Promise((resolve, reject) => {
    sass.render(opts, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
} 

// test
if (process.env.NODE_ENV === 'test') {
  sassStyles('../scss/main.scss').then(data => {
    console.log(data.css.toString('utf8'));
  });
}
