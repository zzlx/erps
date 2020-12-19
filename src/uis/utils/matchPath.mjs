/**
 * *****************************************************************************
 *
 * matchPath
 *
 * Match a URL pathname to a path.
 *
 * *****************************************************************************
 */

import { pathToRegexp } from './path-to-regexp.mjs';

export default function matchPath(pathname, options = {}) {
  const opts = Object.assign({}, {
    path: '/',
    exact: false,
    strict: false,
    sensitive: true,
  }, typeof options === 'string' ? { path: options } : options);

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
 *
 *
 *
 */

const cache = new Map();
const cacheLimit = 10000;

function compilePath(path, options) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache = cache.has(cacheKey) 
    ? cache.get(cacheKey)
    : cache.set(cache, new Map());

  if (pathCache.has(path)) return pathCache.get(path);

  const keys = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = { regexp, keys };

  if (pathCache.size < cacheLimit) {
    pathCache.set(path, result);
  }

  return result;
}
