/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert, inspect } from '../../utils.lib.mjs';
import { isNullableType } from './isNullableType.mjs';

export function assertNullableType(type) {
  assert(
    isNullableType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL nullable type.")
  );
  return type;
}
