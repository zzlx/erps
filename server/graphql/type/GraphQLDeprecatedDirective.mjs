/**
 * Used to declare element of a GraphQL schema as deprecated.
 */

import { DirectiveLocation } from '../language/DirectiveLocation.mjs';
import { GraphQLDirective } from './GraphQLDirective.mjs';
import { GraphQLString } from './GraphQLString.mjs';
import { DEFAULT_DEPRECATION_REASON } from './DEFAULT_DEPRECATION_REASON.mjs';

export const GraphQLDeprecatedDirective = new GraphQLDirective({
  name: 'deprecated',
  description: 'Marks an element of a GraphQL schema as no longer supported.',
  locations: [
    DirectiveLocation.FIELD_DEFINITION, 
    DirectiveLocation.ENUM_VALUE
  ],
  args: {
    reason: {
      type: GraphQLString,
      description: 'Explains why this element was deprecated, usually also including a ' + 'suggestion for how to access supported similar data. Formatted using ' + 'the Markdown syntax (as specified by [CommonMark](https://commonmark.org/).',
      defaultValue: DEFAULT_DEPRECATION_REASON,
    }
  }
});
