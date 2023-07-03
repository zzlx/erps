/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isListType } from './isListType.mjs';

export function assertListType(type) {
  assert(
    isListType(type),
    "Expected ".concat(inspect(type), " to be a GraphQL List type.")
  );
  return type;
}
