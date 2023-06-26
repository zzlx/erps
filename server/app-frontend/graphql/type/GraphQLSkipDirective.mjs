/**
 * Used to conditionally skip (exclude) fields or fragments.
 */

import { GraphQLDirective } from './GraphQLDirective.mjs';
import { GraphQLNonNull } from './GraphQLNonNull.mjs';
import { GraphQLBoolean } from './GraphQLBoolean.mjs';
import { DirectiveLocation } from '../language/DirectiveLocation.mjs';

export const GraphQLSkipDirective = new GraphQLDirective({
  name: 'skip',
  description: 'Directs the executor to skip this field or fragment when the `if` ' + 'argument is true.',
  locations: [
    DirectiveLocation.FIELD, 
    DirectiveLocation.FRAGMENT_SPREAD, 
    DirectiveLocation.INLINE_FRAGMENT
  ],
  args: {
    if: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Skipped when true.'
    }
  }
});
