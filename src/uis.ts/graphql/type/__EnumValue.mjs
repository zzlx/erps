/**
 * *****************************************************************************
 *
 * 
 *
 * *****************************************************************************
 */

import { GraphQLObjectType } from './GraphQLObjectType.mjs';
import { GraphQLNonNull } from './GraphQLNonNull.mjs';
import { GraphQLString } from './GraphQLString.mjs';
import { GraphQLBoolean } from './GraphQLBoolean.mjs';

export const __EnumValue = new GraphQLObjectType({
  name: '__EnumValue',
  description: 
    'One possible value for a given Enum. Enum values are unique values, not ' +
    'a placeholder for a string or numeric value. However an Enum value is ' +
    'returned in a JSON response as a string.',
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
      isDeprecated: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: function resolve(obj) {
          return obj.isDeprecated;
        }
      },
      deprecationReason: {
        type: GraphQLString,
        resolve: function resolve(obj) {
          return obj.deprecationReason;
        }
      }
    };
  }
});
