/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isScalarType } from './isScalarType.mjs';

export function assertScalarType(type) {
  assert(
    isScalarType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Scalar type.")
  ); 
  return type;
}
