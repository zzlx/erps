/**
 * 判断是否为目录分隔符
 */

export function isPathSeparator (code) {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
}
