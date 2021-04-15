/**
 * *****************************************************************************
 *
 * Non-Null Type Wrapper
 *
 * A non-null is a wrapping type which points to another type.
 * Non-null types enforce that their values are never null and can ensure
 * an error is raised if this ever occurs during a request. It is useful for
 * fields which you can make a strong guarantee on non-nullability, for example
 * usually the id field of a database row will never be null.
 *
 * Example:
 *
 *     const RowType = new GraphQLObjectType({
 *       name: 'Row',
 *       fields: () => ({
 *         id: { type: GraphQLNonNull(GraphQLString) },
 *       })
 *     })
 *
 * Note: the enforcement of non-nullability occurs within the executor.
 *
 * *****************************************************************************
 */

import { 
  assert,
  defineToStringTag,
  defineToJSON,
  inspect,
} from '../../utils.lib.mjs';

import { isType } from './definition.mjs';

// eslint-disable-next-line no-redeclare
export class GraphQLNonNull {
  constructor(ofType) {
    if (this instanceof GraphQLNonNull) {
      this.ofType = assertNullableType(ofType);
    } else {
      return new GraphQLNonNull(ofType);
    }
  }

  toString() {
    return String(this.ofType) + '!';
  }
} 

defineToStringTag(GraphQLNonNull);
defineToJSON(GraphQLNonNull);

/**
 * These types can all accept null as a value.
 */

// eslint-disable-next-line no-redeclare
export function isNonNullType(type) {
  return type instanceof GraphQLNonNull;
}

export function assertNonNullType(type) {
  assert(
    isNonNullType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Non-Null type.")
  );
  return type;
}

/**
 * test if it is a nullable type
 */

export function isNullableType(type) {
  return isType(type) && !isNonNullType(type);
}

export function assertNullableType(type) {
  assert(
    isNullableType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL nullable type.")
  );
  return type;
}

/* eslint-disable no-redeclare */
export function getNullableType(type) {
  if (type) {
    return isNonNullType(type) ? type.ofType : type;
  }
}
