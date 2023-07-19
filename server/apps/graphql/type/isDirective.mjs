/**
 * Test if the given value is a GraphQL directive.
 */

import { GraphQLDirective } from './GraphQLDirective.mjs';

// eslint-disable-next-line no-redeclare
export function isDirective(directive) {
  return directive instanceof GraphQLDirective;
}
