/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert, inspect } from '../../utils.lib.mjs';
import { isInterfaceType } from './isInterfaceType.mjs';

export function assertInterfaceType(type) {
  assert(
    isInterfaceType(type),
    "Expected ".concat(inspect(type), " to be a GraphQL Interface type.")
  ); 
  return type;
}
