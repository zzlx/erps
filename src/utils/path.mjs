/* path组件字符 */
const CHAR_DOT = 46;            // .
const CHAR_FORWARD_SLASH = 47;  // 斜杠/
const CHAR_COLON = 58;          //  =
const CHAR_UPPERCASE_A = 65;    // A
const CHAR_UPPERCASE_Z = 90;    // Z
const CHAR_BACKWARD_SLASH = 92; // 反斜杠\
const CHAR_LOWERCASE_A = 97;    // a
const CHAR_LOWERCASE_Z = 122;   // z

/**
 * path路径处理工具
 * 兼容posix、window样式目录
 */

export default new (class Path {

  /**
   * resolve
   */

  resolve(...args) {
    let resolvedPath = '';
    let resolvedAbsolute = false;

    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      const path = i >= 0 ? args[i] : process.cwd();
      if (path.length === 0) continue;
      resolvedPath = `${path}/${resolvedPath}`; 
      resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }

    resolvedPath = normallizeString(resolvedPath, !resolveAbsolute, '/', isPosixPathSeparator);
    if (resolvedAbsolute) return `/${resolvedPath}`;
    return resolvedPath.length > 0 ? resolvedPath : '.';
  }

  /**
   * 
   */

  normalize(path) {
    if (path.length === 0) return '.';
    const isAbsolute = this.isAbsolute(path);

    const trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;

    path = normalizeString(path, !isAbsolute, '/', isPosixPathSeparator);

    if (path.length === 0) {
      if (isAbsolute) return '/';
      return trailingSeparator ? './' : '.';
    }

    if (trailingSeparator) path += '/';

    return isAbsolute ? `/${path}` : path;

  }

  /**
   *
   *
   */

  isPosix (path) {
    const firstCode = path.charCodeAt(0);
    return (isWindowsDeviceRoot(path.charCodeAt(0)) &&
            path.charCodeAt(1) === CHAR_COLON &&
            isPathSeparator(path.charCodeAt(2))); 
  }

  /**
   * 判断是否为绝对路径
   */

  isAbsolute(path) {
    if (path.length === 0) return false;
    
    const code = path.charCodeAt(0);
    return isPathSeparator(code) ||
      (path.length > 2 &&
        isWindowsDeviceRoot(code) &&
        path.charCodeAt(1) === CHAR_COLON &&
        isPathSeparator(path.charCodeAt(2)));
  }

  /**
   * 获取路径的上一级目录
   *
   * @param {string} pathname
   * @return {string} dirname
   */

  dirname(path) {
    if (path.length === 0) return '.';

    const isAbsolute = this.isAbsolute(path);
    let end = -1;
    for (let i = path.length -1; i >= 1; --i) {
      if (isPathSeparator(path.charCodeAt(i))) {
        end = i; 
        break;
      }
    }

    if (end === -1) return isAbsolute ? path.charAt(end) : '.';

    return path.slice(0, end);
  }

  /**
   *
   */

  join(...args) {
    if (args.length === 0) return '.';

    let joined = null;
    for (let i = 0; i < args.length; i++) {
      const part = args[i];
      if (part.length > 0) {
        if (joined == null) joined = part;
        else joined += `/${part}`;
      }
    }

    if (joined == null) return '.';

    return this.normalize(joined);
  }

  /**
   *
   *
   */

  extname () {

  }

  /**
   *
   */

  resolve() {
  }

  /**
   *
   */

  relative (from, to) {
  }

  /**
   * basename
   */

  basename (path, ext) {

  }

  /**
   * 添加前置slash
   */
  addLeadingSlash(path) {
    return path.charAt(0) === '/' ? path : '/' + path;
  }

  /**
   * 去除前置slash
   */
  stripLeadingSlash(path) {
    return path.charAt(0) === '/' ? path.substr(1) : path;
  }

  /**
   * 
   */

  hasBasename(path, prefix) {
    return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
  }

  stripBasename(path, prefix) {
    return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
  }

  /**
   * 去掉尾部slash
   */

  stripTrailingSlash(path) {
    return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
  }

  /**
   * 解析path
   */

  parse (path) {
    const ret = { root: '', dir: '', base: '', ext: '', name: '' };

    if (path.length === 0) return ret;
    const isAbsolute = this.isAbsolute(path);

    let start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    let preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      const code = path.charCodeAt(i);
      if (code === CHAR_FORWARD_SLASH) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === CHAR_DOT) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (end !== -1) {
      const start = startPart === 0 && isAbsolute ? 1 : startPart;
      if (startDot === -1 ||
          // We saw a non-dot character immediately before the dot
          preDotState === 0 ||
          // The (right-most) trimmed path component is exactly '..'
          (preDotState === 1 &&
          startDot === end - 1 &&
          startDot === startPart + 1)) {
        ret.base = ret.name = path.slice(start, end);
      } else {
        ret.name = path.slice(start, startDot);
        ret.base = path.slice(start, end);
        ret.ext = path.slice(startDot, end);
      }
    }

    if (startPart > 0)
      ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute)
      ret.dir = '/';

    return ret;

  } // end of parse

  /**
   * 解析url路径
   */

  urlParser(path) {

    let pathname = path || '/';
    let search = '';
    let hash = '';

    // 哈希索引号
    const hashIndex = pathname.indexOf('#');

    if (hashIndex !== -1) {
      hash = pathname.substr(hashIndex);
      pathname = pathname.substr(0, hashIndex);
    }

    // 查询字符串索引号
    const searchIndex = pathname.indexOf('?');

    if (searchIndex !== -1) {
      search = pathname.substr(searchIndex);
      pathname = pathname.substr(0, searchIndex);
    }

    return {
      pathname: pathname,
      search: search === '?' ? '' : search,
      hash: hash === '#' ? '' : hash
    };
  }

  /**
   * 从loccation创建path url
   *
   */
  createPath(location) {
    let pathname = location.pathname,
        search = location.search,
        hash = location.hash;

    let path = pathname || '/';
    if (search && search !== '?') path += search.charAt(0) === '?' ? search : '?' + search;
    if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : '#' + hash;

    return path;
  }

  /**
   * splice
   */

  spliceOne(list, index) {
    for (let i = index, k = i + 1 ; k < list.length; i ++, k ++) {
      list[i] = list[k];
    }

    //pop()方法从数组中删除最后一个元素，并返回该元素的值。此方法更改数组的长度。 
    list.pop();
  }

  /**
   * 处理pathname
   * resolve pathname
   */

  resolvePathname(to) {
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


  isValidName(value) {
    const nameRegexp = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
    return nameRegexp.test(String(value));
  }


  createLocation(path, state, key, currentLocation) {
    let location = void 0;

    if (typeof path === 'string') {
      // Two-arg form: push(path, state)
      location = this.urlParser(path);
      location.state = state;
    } else {
      // One-arg form: push(location)
      location = Object.assign({}, path);

      // set pathname
      if (location.pathname === undefined) location.pathname = '';

      // set search
      if (location.search) {
        if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
      } else {
        location.search = '';
      }

      // set hash
      if (location.hash) {
        if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
      } else {
        location.hash = '';
      }

      if (state !== undefined && location.state === undefined) location.state = state;
    }

    try {
      location.pathname = decodeURI(location.pathname);
    } catch (e) {
      if (e instanceof URIError) {
        throw new URIError(
          'pathname "' + location.pathname + '" could not be decoded. ' + 
          'This is likely caused by an invalid percent-encoding.'
        );
      } else {
        throw e;
      }
    }

    if (key) location.key = key;

    // 
    if (currentLocation) {
      // Resolve incomplete/relative pathname relative to current location.
      if (!location.pathname) {
        location.pathname = currentLocation.pathname;
      } else if (location.pathname.charAt(0) !== '/') {
        // 获取相对pathname
        location.pathname = Path.resolvePathname(
          location.pathname, 
          currentLocation.pathname
        );
      }
    } else {
      // When there is no prior location and pathname is empty, set it to /
      if (!location.pathname) {
        location.pathname = '/';
      }
    }

    return location;
  }
})();

/******************************************************************************/
/* 以下为工具函数 */

/**
 * 判断是否为目录分隔符
 */

function isPathSeparator (code) {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
}

/**
 * 判断是否为Posix目录分隔符 
 */

function isPosixPathSeparator (code) {
  return code === CHAR_FORWARD_SLASH;
}

/**
 * 判断是否为windows根设备
 */

function isWindowsDeviceRoot(code) {
  return (code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z) || 
         (code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z); 
}

/**
 *
 *
 */

function _format (sep, pathObject) {
  if (pathObject === null || typeof pathObject !== 'object') {
    throw new TypeError('pathObject must be objtct.');
  }

  const dir = pathObject.dir || pathObject.root;
  const base = pathObject.base || `${pathObject.name || ''}${pathObject.ext || ''}`;

  if (!dir) return base;
  return dir === pathObject.root ? `${dir}${base}` : `${dir}${sep}${base}`;
}

/**
 * resolve . and .. in path segment
 */

function normalizeString (path, allowAboveRoot, separator, isPathSeparator) {
  let res = '';
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;

  for (let i = 0; i <= path.length; ++i) {

    if (i < path.length) code = path.charCodeAt(i);
    else if (isPathSeparator(code)) break;
    else code = CHAR_FORWARD_SLASH;

    if (isPathSeparator(code)) {
      if (lastSlash === i - 1 || dots === 1) {
        // 
      } else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 ||
            res.charCodeAt(res.length - 1) !== CHAR_DOT ||
            res.charCodeAt(res.length - 2) !== CHAR_DOT ) 
        {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = '';
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
            }

            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length !== 0) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }

        if (allowAboveRoot) {
          res += res.length > 0 ? `${separator}..` : '..';
          lastSegmentLength = 2;
        }

      } else {
        if (res.length > 0) res += `${separator}${path.slice(lastSlash +1, i)}`;
        else res = path.slice(lastSlash +1, i);
        lastSegmentLength = i - lastSlash -1;
      }
      lastSlash = i;
      dots = 0;

    } else if (code === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  } // end of for loop

  return res;
}

