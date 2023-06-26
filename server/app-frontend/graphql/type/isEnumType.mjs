/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { GraphQLEnumType } from './GraphQLEnumType.mjs';

// eslint-disable-next-line no-redeclare
export function isEnumType(type) {
  return type instanceof GraphQLEnumType;
}

