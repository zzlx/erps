import { assert, inspect } from '../../utils.lib.mjs';
import { isNamedType } from './isNamedType.mjs';

export function assertNamedType(type) {
  assert(
    isNamedType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL named type.")
  );
  return type;
}
