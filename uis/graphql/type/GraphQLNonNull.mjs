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

import { assert } from '../../utils/assert.mjs';
import { defineToStringTag } from '../../utils/defineToStringTag.mjs';
import { defineToJSON } from '../../utils/defineToJSON.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isType } from './isType.mjs';
import { assertNullableType } from './assertNullableType.mjs';

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
