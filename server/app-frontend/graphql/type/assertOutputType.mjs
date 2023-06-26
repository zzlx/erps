import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isOutputType } from './isOutputType.mjs';

export function assertOutputType(type) {
  assert(
    isOutputType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL output type.")
  );
  return type;
}
