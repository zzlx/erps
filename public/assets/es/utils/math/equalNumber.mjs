/**
 * *****************************************************************************
 * 
 *
 * *****************************************************************************
 */

if (!Number.EPSILON) {
  Number.EPSILON = Math.pow(2, -52);
}

export const equalNumber = (n1, n2) => {
  return Math.abs(n1 - n2) < Number.EPSILON;
}
