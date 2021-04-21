/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { GraphQLUnionType } from './GraphQLUnionType.mjs';

// eslint-disable-next-line no-redeclare
export function isUnionType(type) {
  return type instanceof GraphQLUnionType;
}
