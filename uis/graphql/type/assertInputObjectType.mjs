/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isInputObjectType } from './isInputObjectType.mjs';

export function assertInputObjectType(type) {
  assert(
    isInputObjectType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Input Object type.")
  );
  return type;
}
