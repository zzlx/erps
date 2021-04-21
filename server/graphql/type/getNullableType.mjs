/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { isNonNullType } from './isNonNullType.mjs';

/* eslint-disable no-redeclare */
export function getNullableType(type) {
  if (type) {
    return isNonNullType(type) ? type.ofType : type;
  }
}
