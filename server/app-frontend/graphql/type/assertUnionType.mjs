/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isUnionType } from './isUnionType.mjs';

export function assertUnionType(type) {
  assert(
    isUnionType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Union type.")
  ); 
  return type;
}

