/**
 * *****************************************************************************
 *
 * *****************************************************************************
 */

export function hasBasename(path, prefix = '') {
  return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
}