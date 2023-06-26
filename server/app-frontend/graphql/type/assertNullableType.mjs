/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isNullableType } from './isNullableType.mjs';

export function assertNullableType(type) {
  assert(
    isNullableType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL nullable type.")
  );
  return type;
}
