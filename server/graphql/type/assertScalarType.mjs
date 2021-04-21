/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert, inspect } from '../../utils.lib.mjs';
import { isScalarType } from './isScalarType.mjs';

export function assertScalarType(type) {
  assert(
    isScalarType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Scalar type.")
  ); 
  return type;
}
