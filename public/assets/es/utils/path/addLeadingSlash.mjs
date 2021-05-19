/**
 * 添加前置slash
 */
export function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

