/**
 * *****************************************************************************
 *
 * 
 *
 * *****************************************************************************
 */

import { isInvalid }from '../../utils/isInvalid.mjs';
import { astFromValue } from '../utilities/astFromValue.mjs';
import { print } from '../language/print.mjs';
import { GraphQLObjectType } from './GraphQLObjectType.mjs';
import { GraphQLNonNull } from './GraphQLNonNull.mjs';
import { GraphQLString } from './GraphQLString.mjs';
import { GraphQLBoolean } from './GraphQLBoolean.mjs';

export const __InputValue = new GraphQLObjectType({
  name: '__InputValue',
  description: 
    'Arguments provided to Fields or Directives and the input fields of an ' +
    'InputObject are represented as Input Values which describe their type ' +
    'and optionally a default value.',
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
      type: {
        type: new GraphQLNonNull(__Type),
        resolve: function resolve(obj) {
          return obj.type;
        }
      },
      defaultValue: {
        type: GraphQLString,
        description: 
          'A GraphQL-formatted string representing the default value for this ' +
          'input value.',
        resolve: function resolve(inputVal) {
          return isInvalid(inputVal.defaultValue) ? null : print(astFromValue(inputVal.defaultValue, inputVal.type));
        }
      }
    };
  }
});

