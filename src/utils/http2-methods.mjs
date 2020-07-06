/**
 * *****************************************************************************
 *
 * Methods
 *
 * *****************************************************************************
 */

import global from './global.mjs';
import http2 from 'http2';

const methods = []; // http methods

// 遍历https.constants对象,取出methods
Object.keys(http2.constants).forEach(v => {
  if (/^HTTP2_METHOD/.test(v)) methods.push(http2.constants[v]);
});

// test
//console.log(methods);
export default methods;
