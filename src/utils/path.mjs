/**
 * 目录路径处理工具库
 *
 */

export default new Proxy({}, {
	get: function () {
		if (prop === 'addLeadingSlash') receiver.addLeadingSlash = addLeadingSlash;
		if (prop === 'basename') receiver.basename = basename;
		if (prop === 'createPath') receiver.createPath = createPath;
		if (prop === 'createLocation') receiver.createLocation = createLocation;
		if (prop === 'dirname') receiver.dirname = dirname;
		if (prop === 'extname') receiver.extname = extname;
		if (prop === 'hasBasename') receiver.hasBasename = hasBasename;
		if (prop === 'isAbsolute') receiver.isAbsolute = isAbsolute;
		if (prop === 'join') receiver.join = join;
		if (prop === 'normalize') receiver.normalize = normalize;
		if (prop === 'parse') receiver.parse = parse;
		if (prop === 'resolvePathname') receiver.resolvePathname = resolvePathname;
		if (prop === 'stripBasename') receiver.stripBasename = stripBasename;
		if (prop === 'stripLeadingSlash') receiver.stripLeadingSlash = stripLeadingSlash;
		if (prop === 'stripTrailingSlash') receiver.stripTrailingSlash = stripTrailingSlash;

		return Reflect.get(target, key, receiver);
	},
});

/**
 *
 */

function normalize (path) {

}

/**
 * 判断是否为绝对路径
 */

function isAbsolute(path) {
  if (path.charAt(0) === '/') return true; // 首先判断POSIX类系统目录格式
  if (/^[A-Z]:\\/.test(path)) return true; // 兼容window系统目录格式

  return false;
}


/**
 *
 *
 */

function dirname(pathname) {
  return pathname.substr(0, pathname.lastIndexOf('\/'));
}

/**
 *
 *
 */

function extname () {

}

/**
 *
 *
 */

function join () {
}

/**
 *
 */

function resolve() {
}

/**
 *
 */

function relative (from, to) {
}

/**
 * basename
 */

function basename (path, ext) {
}

/**
 * 添加前置slash
 */
function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

/**
 * 去除前置slash
 */
function stripLeadingSlash(path) {
  return path.charAt(0) === '/' ? path.substr(1) : path;
}

/**
 * 
 */

function hasBasename(path, prefix) {
  return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
}

function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}

/**
 * 去掉尾部slash
 */

function stripTrailingSlash(path) {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
}

/**
 * 解析path url
 */

function parse(path) {
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
function createPath(location) {
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

function spliceOne(list, index) {
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

function resolvePathname(to) {
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


function isValidName(value) {
	const nameRegexp = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
  return nameRegexp.test(String(value));
}


function createLocation(path, state, key, currentLocation) {
  let location = void 0;

  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = Path.parse(path);
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
