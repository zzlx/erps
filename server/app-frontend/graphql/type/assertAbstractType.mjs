import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isAbstractType } from './isAbstractType.mjs';

export function assertAbstractType(type) {
  assert(
    isAbstractType(type),
    "Expected ".concat(inspect(type), " to be a GraphQL abstract type.")
  );

  return type;
}
