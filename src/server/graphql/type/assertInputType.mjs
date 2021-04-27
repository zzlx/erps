import { assert, inspect } from '../../utils.lib.mjs';
import { isInputType } from './isInputType.mjs';

export function assertInputType(type) {
  assert(
    isInputType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL input type.")
  );
  return type;
}
