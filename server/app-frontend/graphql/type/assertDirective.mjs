import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isDirective } from './isDirective.mjs';

export function assertDirective(directive) {
  assert(
    isDirective(directive), 
    "Expected ".concat(inspect(directive), " to be a GraphQL directive."));
  return directive;
}
