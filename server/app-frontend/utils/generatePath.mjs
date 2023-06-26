/**
 * *****************************************************************************
 *
 * Public API for generating a URL pathname from a path and parameters.
 *
 * *****************************************************************************
 */

import { compile } from "./regularPath.mjs";

const cache = {};
const cacheLimit = 10000;
let cacheCount = 0;

// compile
function compilePath(path) {
  if (cache[path]) return cache[path];

  const generator = compile(path);

  if (cacheCount < cacheLimit) {
    cache[path] = generator;
    cacheCount++;
  }

  return generator;
}

export function generatePath(path = "/", params = {}) {
  return path === "/" ? path : compilePath(path)(params, { pretty: true });
}
