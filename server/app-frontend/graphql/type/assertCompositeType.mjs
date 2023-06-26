import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isCompositeType } from './isCompositeType.mjs';

export function assertCompositeType(type) {
  assert( 
    isCompositeType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL composite type.")
  );
  return type;
}
