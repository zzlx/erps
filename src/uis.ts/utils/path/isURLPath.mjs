/**
 * 判断是否为URL根路径
 */

export function isURLPath(path) {
  return path.length > 8 && 
    (path.substr(0, 7) === 'http://' || path.substr(0, 8) === 'https://');
}
