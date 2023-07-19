/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { GraphQLScalarType } from './GraphQLScalarType.mjs';

// eslint-disable-next-line no-redeclare
export function isScalarType(type) {
  return type instanceof GraphQLScalarType;
}
