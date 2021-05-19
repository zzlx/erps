/**
 * dirname
 *
 * dir name of the path
 *
 * @param {string} pathname
 * @return {string} dirname
 */

import { isAbsolute } from './isAbsolute.mjs';
import { isPathSeparator } from './isPathSeparator.mjs';

export function dirname(path) {
  // const __dirname = p => p.substr(0, p.lastIndexOf('/'));
  if (path.length === 0) return '.';

  const isAbsolutePath = isAbsolute(path);

  let end = -1;

  // 倒序检测字符是否为path separator
  for (let i = path.length -1; i >= 1; --i) {
    // 监测到path separator,记录位置,终止检测
    if (isPathSeparator(path.charCodeAt(i))) {
      end = i; 
      break;
    }

  }

  // 未检测到path分隔符
  if (end === -1) return isAbsolutePath ? path.charAt(end) : '.';

  return path.slice(0, end);
}
