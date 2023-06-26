import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isLeafType } from './isLeafType.mjs';

export function assertLeafType(type) {
  assert(
    isLeafType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL leaf type.")
  );
  return type;
}
