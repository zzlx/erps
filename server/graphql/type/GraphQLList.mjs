/**
 * *****************************************************************************
 *
 * List Type Wrapper
 *
 * A list is a wrapping type which points to another type.
 * Lists are often created within the context of defining the fields of
 * an object type.
 *
 * Example:
 *
 *     const PersonType = new GraphQLObjectType({
 *       name: 'Person',
 *       fields: () => ({
 *         parents: { type: GraphQLList(PersonType) },
 *         children: { type: GraphQLList(PersonType) },
 *       })
 *     })
 *
 * *****************************************************************************
 */

import { 
  assert, 
  defineToStringTag,
  defineToJSON,
  inspect,
} from '../../utils.lib.mjs';

// eslint-disable-next-line no-redeclare
export class GraphQLList {
  constructor(ofType) {
    if (this instanceof GraphQLList) {
      this.ofType = assertType(ofType);
    } else {
      return new GraphQLList(ofType);
    }
  }

  toString() {
    return '[' + String(this.ofType) + ']';
  }

}

defineToStringTag(GraphQLList);
defineToJSON(GraphQLList);

// eslint-disable-next-line no-redeclare
export function isListType(type) {
  return type instanceof GraphQLList;
}

export function assertListType(type) {
  assert(
    isListType(type),
    "Expected ".concat(inspect(type), " to be a GraphQL List type.")
  );
  return type;
}

