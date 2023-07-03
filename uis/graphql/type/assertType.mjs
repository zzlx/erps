import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isType } from './isType.mjs';

export function assertType(type) {
  assert(isType(type), "Expected ".concat(inspect(type), " to be a GraphQL type."));
  return type;
}
