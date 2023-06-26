/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isEnumType } from './isEnumType.mjs';

export function assertEnumType(type) {
  assert(
    isEnumType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Enum type.")
  );
  return type;
}
