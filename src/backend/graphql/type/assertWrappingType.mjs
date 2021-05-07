import { assert, inspect } from '../../utils.lib.mjs';
import { isWrappingType } from './isWrappingType.mjs';

export function assertWrappingType(type) {
  assert(
    isWrappingType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL wrapping type.")
  );
  return type;
}
