/**
 * *****************************************************************************
 *
 * 环境
 *
 * *****************************************************************************
 */

import global from './global.mjs';

let env = null;

if (global && global.process && global.process.versions && global.process.versions.node) {
  env = 'node'; // node环境
}

if (global && global.document) {
  env = 'browser'; // 浏览器环境
}

export default env; 
