/**
 * Used to conditionally include fields or fragments.
 */

import { GraphQLDirective } from './GraphQLDirective.mjs';
import { GraphQLNonNull } from './GraphQLNonNull.mjs';
import { GraphQLBoolean } from './GraphQLBoolean.mjs';
import { DirectiveLocation } from '../language/DirectiveLocation.mjs';

export const GraphQLIncludeDirective = new GraphQLDirective({
  name: 'include',
  description: 'Directs the executor to include this field or fragment only when ' + 'the `if` argument is true.',
  locations: [
    DirectiveLocation.FIELD, 
    DirectiveLocation.FRAGMENT_SPREAD, 
    DirectiveLocation.INLINE_FRAGMENT
  ],
  args: {
    if: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Included when true.'
    }
  }
});
