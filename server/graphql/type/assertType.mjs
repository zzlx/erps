import { isType } from './isType.mjs';
import { assert, inspect } from '../../utils.lib.mjs';

export function assertType(type) {
  assert(isType(type), "Expected ".concat(inspect(type), " to be a GraphQL type."));
  return type;
}
