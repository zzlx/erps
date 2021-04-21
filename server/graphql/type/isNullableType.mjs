/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { isType } from './isType.mjs';
import { isNonNullType } from './isNonNullType.mjs';

export function isNullableType(type) {
  return isType(type) && !isNonNullType(type);
}
