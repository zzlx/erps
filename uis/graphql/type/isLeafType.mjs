/**
 * These types may describe types which may be leaf values.
 */

import { isScalarType } from './isScalarType.mjs';
import { isEnumType } from './isEnumType.mjs';

export function isLeafType(type) {
  return isScalarType(type) || isEnumType(type);
}
