/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { GraphQLObjectType } from './GraphQLObjectType.mjs';

// eslint-disable-next-line no-redeclare
export function isObjectType(type) {
  return type instanceof GraphQLObjectType;
}
