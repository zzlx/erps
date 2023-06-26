/**
 * 处理pathname
 * resolve pathname
 */

import { isAbsolute } from './isAbsolute.mjs';
import { isURLPath } from './isURLPath.mjs';

export function resolvePathname(to) {
  const from = arguments.length > 1 && arguments[1] !== undefined 
    ? arguments[1] 
    : '';

  const toParts = to ? to.split('/') : [];
  let fromParts = from ? from.split('/') : [];

  const isToAbs = to && isAbsolute(to);
  const isFromAbs = from && isAbsolute(from);
  const mustEndAbs = isToAbs || isFromAbs;

  if (isToAbs) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/'; // 返回默认值

  let hasTrailingSlash = void 0;
  if (fromParts.length) {
    const last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  let up = 0;
  for (let i = fromParts.length; i >= 0; i--) {
    const part = fromParts[i];
    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) {
    for (; up--; up) {
      fromParts.unshift('..');
    }
  }

  if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) {
    fromParts.unshift('');
  }

  let result = fromParts.join('/');

  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';

  return result; // 返回路径
}

