/**
 *
 *
 *
 *
 *
 *
 *
 */

import { Kind } from '../language/index.mjs';
import { GraphQLList, GraphQLNonNull } from '../type/index.mjs';

export function typeFromAST(schema, typeNode) {
  let innerType;

  if (typeNode.kind === Kind.LIST_TYPE) {
    innerType = typeFromAST(schema, typeNode.type);
    return innerType && new GraphQLList(innerType);
  }

  if (typeNode.kind === Kind.NON_NULL_TYPE) {
    innerType = typeFromAST(schema, typeNode.type);
    return innerType && new GraphQLNonNull(innerType);
  }

  if (typeNode.kind === Kind.NAMED_TYPE) {
    return schema.getType(typeNode.name.value);
  }

  /* istanbul ignore next */
  throw new Error("Unexpected type kind: ".concat(typeNode.kind, "."));
}
