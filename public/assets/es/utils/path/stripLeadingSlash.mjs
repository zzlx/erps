/**
 * 去除前置slash
 */

export function stripLeadingSlash(path) {
  return path.charAt(0) === '/' ? path.substr(1) : path;
}

