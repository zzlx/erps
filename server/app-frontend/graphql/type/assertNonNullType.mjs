/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isNonNullType } from './isNonNullType.mjs';

export function assertNonNullType(type) {
  assert(
    isNonNullType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Non-Null type.")
  );
  return type;
}
