/**
 * *****************************************************************************
 *
 * Produces a GraphQLError representing a syntax error, containing useful
 * descriptive information about the syntax error's position in the source.
 *
 * *****************************************************************************
 */

import { GraphQLError } from './GraphQLError.mjs';

export function syntaxError(source, position, description) {
  return new GraphQLError(
    "Syntax Error: ".concat(description), 
    undefined, 
    source, 
    [position]
  );
}
