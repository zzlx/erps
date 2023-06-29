/**
 * *****************************************************************************
 *
 * strip leading slash
 *
 * *****************************************************************************
 */

export function stripLeadingSlash(path) {
  let retval = path;
  while (retval.charAt(0) === '/') { retval = retval.substr(1); }
  return retval;
}
