/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isObjectType } from './isObjectType.mjs';

export function assertObjectType(type) {
  assert(
    isObjectType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Object type.")
  );
  return type;
}
