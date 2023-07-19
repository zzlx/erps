/**
 * *****************************************************************************
 *
 * 
 *
 * *****************************************************************************
 */

import { GraphQLNonNull } from './GraphQLNonNull.mjs';
import { GraphQLList } from './GraphQLList.mjs';
import { GraphQLObjectType } from './GraphQLObjectType.mjs';
import { __Type } from './__Type.mjs';

export const __Schema = new GraphQLObjectType({
  name: '__Schema',
  description: 
    'A GraphQL Schema defines the capabilities of a GraphQL server. It ' +
    'exposes all available types and directives on the server, as well as ' + 
    'the entry points for query, mutation, and subscription operations.',
  fields: function fields() {
    return {
      types: {
        description: 'A list of all types supported by this server.',
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__Type))),
        resolve: function resolve(schema) {
          return Object.values(schema.getTypeMap());
        }
      },
      queryType: {
        description: 'The type that query operations will be rooted at.',
        type: new GraphQLNonNull(__Type),
        resolve: function resolve(schema) {
          return schema.getQueryType();
        }
      },
      mutationType: {
        description: 'If this server supports mutation, the type that ' +
          'mutation operations will be rooted at.',
        type: __Type,
        resolve: function resolve(schema) {
          return schema.getMutationType();
        }
      },
      subscriptionType: {
        description: 'If this server support subscription, the type that ' +
          'subscription operations will be rooted at.',
        type: __Type,
        resolve: function resolve(schema) {
          return schema.getSubscriptionType();
        }
      },
      directives: {
        description: 'A list of all directives supported by this server.',
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__Directive))),
        resolve: function resolve(schema) {
          return schema.getDirectives();
        }
      }
    };
  }
});
