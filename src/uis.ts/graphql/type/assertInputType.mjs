import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isInputType } from './isInputType.mjs';

export function assertInputType(type) {
  assert(
    isInputType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL input type.")
  );
  return type;
}
