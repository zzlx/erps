/**
 * *****************************************************************************
 *
 * *****************************************************************************
 */

export function isNumber (v) {
  const decimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;
  const thousandsFormatRegExp = /\B(?=(\d{3})+(?!\d))/g;

  if ('number' === typeof v) return true;
  if ('string' === typeof v) return Number.isFinite(Number(v.replace(/[,?]/g, '')));
  return false;
}

