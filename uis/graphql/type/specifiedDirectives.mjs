/**
 * The full list of specified directives.
 */

import { GraphQLIncludeDirective } from './GraphQLIncludeDirective.mjs';
import { GraphQLSkipDirective } from './GraphQLSkipDirective.mjs';
import { GraphQLDeprecatedDirective } from './GraphQLDeprecatedDirective.mjs';

export const specifiedDirectives = [
  GraphQLIncludeDirective, 
  GraphQLSkipDirective, 
  GraphQLDeprecatedDirective
];
