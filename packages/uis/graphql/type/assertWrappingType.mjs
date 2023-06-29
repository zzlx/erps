import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isWrappingType } from './isWrappingType.mjs';

export function assertWrappingType(type) {
  assert(
    isWrappingType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL wrapping type.")
  );
  return type;
}
