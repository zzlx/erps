import { isOutputType } from './isOutputType.mjs';
import { assert, inspect } from '../../utils.lib.mjs';

export function assertOutputType(type) {
  assert(
    isOutputType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL output type.")
  );
  return type;
}
