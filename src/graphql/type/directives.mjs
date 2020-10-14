/**
 * Directives are used by the GraphQL runtime as a way of modifying execution
 * behavior. 
 * Type system creators will usually not create these directly.
 *
 */

import {
  assert,
  defineToStringTag,
  defineToJSON,
  inspect,
} from '../../utils.lib.mjs';

import { GraphQLNonNull } from './definition.mjs';
import { GraphQLString, GraphQLBoolean } from './scalars.mjs';
import { DirectiveLocation } from '../language/directiveLocation.mjs';

export class GraphQLDirective {
  constructor (config) {
    this.name = config.name;
    this.description = config.description;
    this.locations = config.locations;
    this.astNode = config.astNode;

    assert(config.name, 'Directive must be named.');
    assert(Array.isArray(config.locations), 
      "@".concat(config.name, " locations must be an Array.")
    ); 

    const args = config.args || {};

    assert(
      typeof args === 'object' && !Array.isArray(args),
      `@${config.name} args must be an object with argument names as keys.`
    ); 

    this.args = Object.entries(args).map(_ref => {
      const argName = _ref[0];
      const arg = _ref[1];

      return {
        name: argName,
        description: arg.description === undefined ? null : arg.description,
        type: arg.type,
        defaultValue: arg.defaultValue,
        astNode: arg.astNode
      };
    });
  }

  toString() {
    return '@' + this.name;
  }
}

defineToStringTag(GraphQLDirective);
defineToJSON(GraphQLDirective);

/**
 * Used to conditionally include fields or fragments.
 */
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

/**
 * Used to conditionally skip (exclude) fields or fragments.
 */

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

/**
 * Constant string used for default reason for a deprecation.
 */

export const DEFAULT_DEPRECATION_REASON = 'No longer supported';

/**
 * Used to declare element of a GraphQL schema as deprecated.
 */

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
      defaultValue: DEFAULT_DEPRECATION_REASON
    }
  }
});

/**
 * The full list of specified directives.
 */

export const specifiedDirectives = [
  GraphQLIncludeDirective, 
  GraphQLSkipDirective, 
  GraphQLDeprecatedDirective
];

export function isSpecifiedDirective(directive) {
  return specifiedDirectives.some(function (specifiedDirective) {
    return specifiedDirective.name === directive.name;
  });
}

/**
 * Test if the given value is a GraphQL directive.
 */

// eslint-disable-next-line no-redeclare
export function isDirective(directive) {
  return directive instanceof GraphQLDirective;
}

export function assertDirective(directive) {
  !isDirective(directive) 
    ? assert(0, 
      "Expected ".concat(inspect(directive), " to be a GraphQL directive.")
    ) 
    : void 0;
  return directive;
}
