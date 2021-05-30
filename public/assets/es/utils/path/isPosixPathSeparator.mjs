/**
 * 判断是否为Posix目录分隔符 
 */

const CHAR_FORWARD_SLASH = '/'.charCodeAt(0);  // 斜杠/

export function isPosixPathSeparator (code) {
  return code === CHAR_FORWARD_SLASH;
}

