import { isLeafType } from './isLeafType.mjs';
import { assert, inspect } from '../../utils.lib.mjs';

export function assertLeafType(type) {
  assert(
    isLeafType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL leaf type.")
  );
  return type;
}
