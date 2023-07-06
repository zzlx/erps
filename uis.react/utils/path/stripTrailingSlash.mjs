/**
 * *****************************************************************************
 *
 * Strip trailing slash
 *
 * *****************************************************************************
 */

export function stripTrailingSlash(path) {
  let retval = path;
  while (retval.charAt(retval.length -1) === '/') { retval = retval.slice(0, -1); }
  return retval;
}
