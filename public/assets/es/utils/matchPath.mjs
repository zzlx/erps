/**
 * *****************************************************************************
 *
 * matchPath
 *
 * Match a URL pathname to a path.
 *
 * *****************************************************************************
 */

import { pathToRegexp } from './regularPath.mjs';

export function matchPath(pathname, options = {}) {
  const opts = { 
    path: '/', 
    exact: false, 
    strict: false, 
    sensitive: true, 
  };

  if (typeof options === 'string' || options instanceof RegExp) {
    opts.path = options;
  } else {
    if (options.path != null) opts.path = options.path;
    if (options.exact != null) opts.exact = options.exact;
    if (options.strict != null) opts.strict = options.strict;
    if (options.sensitive != null) opts.sensitive = options.sensitive;
  }

  const paths = [].concat(opts.path);

  return paths.reduce((matched, path) => {
    if (!path) return null;
    if (matched) return matched;

    const { regexp, keys } = compilePath(path, {
      end: opts.exact,
      strict: opts.strict,
      sensitive: opts.sensitive,
    });

    const match = regexp.exec(pathname);

    if (!match) return null;

    const url = match[0];
    const values = match.slice(1);
    const isExact = pathname === url;

    if (opts.exact && !isExact) return null;

    return {
      path, // the path used to match the matched portion of the URL
      url: path === "/" && url === "" ? "/" : url, 
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}

/**
 * compile path
 */

const cache = new Map();
const cacheLimit = 1000; // 1000个地址

function compilePath(path, options) {
  const key = `${path}_${options.end}${options.strict}${options.sensitive}`;

  if (cache.has(key)) return cache.get(key);

  const keys = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = { regexp, keys };

  if (cache.size < cacheLimit) cache.set(key, result);

  return result;
}
