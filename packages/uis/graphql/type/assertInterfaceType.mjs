/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isInterfaceType } from './isInterfaceType.mjs';

export function assertInterfaceType(type) {
  assert(
    isInterfaceType(type),
    "Expected ".concat(inspect(type), " to be a GraphQL Interface type.")
  ); 
  return type;
}
