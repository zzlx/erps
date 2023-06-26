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

import { defineToStringTag } from '../../utils/defineToStringTag.mjs';
import { defineToJSON } from '../../utils/defineToJSON.mjs';

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
