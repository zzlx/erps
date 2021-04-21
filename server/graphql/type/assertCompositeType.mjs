import { isCompositeType } from './isCompositeType.mjs';
import { assert, inspect } from '../../utils.lib.mjs';

export function assertCompositeType(type) {
  assert( 
    isCompositeType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL composite type.")
  );
  return type;
}
