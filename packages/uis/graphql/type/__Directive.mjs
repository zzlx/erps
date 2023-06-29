/**
 * *****************************************************************************
 *
 * 
 *
 * *****************************************************************************
 */

import { __DirectiveLocation } from './__DirectiveLocation.mjs';
import { __InputValue } from './__InputValue.mjs';
import { GraphQLObjectType } from './GraphQLObjectType.mjs';
import { GraphQLNonNull } from './GraphQLNonNull.mjs';
import { GraphQLString } from './GraphQLString.mjs';
import { GraphQLList } from './GraphQLList.mjs';

export const __Directive = new GraphQLObjectType({
  name: '__Directive',
  description: 'A Directive provides a way to describe alternate runtime execution and ' + 'type validation behavior in a GraphQL document.' + "\n\nIn some cases, you need to provide options to alter GraphQL's " + 'execution behavior in ways field arguments will not suffice, such as ' + 'conditionally including or skipping a field. Directives provide this by ' + 'describing additional information to the executor.',
  fields: function fields() {
    return {
      name: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: function resolve(obj) {
          return obj.name;
        }
      },
      description: {
        type: GraphQLString,
        resolve: function resolve(obj) {
          return obj.description;
        }
      },
      locations: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__DirectiveLocation))),
        resolve: function resolve(obj) {
          return obj.locations;
        }
      },
      args: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__InputValue))),
        resolve: function resolve(directive) {
          return directive.args || [];
        }
      }
    };
  }
});
