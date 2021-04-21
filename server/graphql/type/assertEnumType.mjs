/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert, inspect } from '../../utils.lib.mjs';
import { isEnumType } from './isEnumType.mjs';

export function assertEnumType(type) {
  assert(
    isEnumType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Enum type.")
  );
  return type;
}
