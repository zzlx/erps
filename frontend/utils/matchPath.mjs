/**
 * matchPath
 *
 * Match a URL pathname to a path.
 *
 * 
 * 
 * @file: matchPath.mjs 
 */

import { pathToRegexp } from './path-to-regexp.mjs';

export default function matchPath(pathname, options = {}) {
  options = typeof options === 'string' ? { path: options } : options;
  const { path, exact = false, strict = false, sensitive = true } = options;
  const paths = [].concat(path);

  return paths.reduce((matched, path) => {
    if (!path) return null;
    if (matched) return matched;

    const { regexp, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });

    const match = regexp.exec(pathname);

    if (!match) return null;

    const url = match[0];
    const values = match.slice(1);
    const isExact = pathname === url;

    if (exact && !isExact) return null;

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
