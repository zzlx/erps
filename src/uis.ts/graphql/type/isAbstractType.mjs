/**
 * These types may describe the parent context of a selection set.
 */

import { isInterfaceType } from './isInterfaceType.mjs';
import { isUnionType } from './isUnionType.mjs';

export function isAbstractType(type) {
  return isInterfaceType(type) || isUnionType(type);
}
