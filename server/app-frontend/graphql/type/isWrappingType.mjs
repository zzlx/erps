/**
 * These types wrap and modify other types
 */

import { isListType } from './isListType.mjs';
import { isNonNullType } from './isNonNullType.mjs';

export function isWrappingType(type) {
  return isListType(type) || isNonNullType(type);
}
