/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert, inspect } from '../../utils.lib.mjs';
import { isNonNullType } from './isNonNullType.mjs';

export function assertNonNullType(type) {
  assert(
    isNonNullType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Non-Null type.")
  );
  return type;
}
