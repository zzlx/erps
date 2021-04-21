/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { GraphQLNonNull } from './GraphQLNonNull.mjs';

// eslint-disable-next-line no-redeclare
export function isNonNullType(type) {
  return type instanceof GraphQLNonNull;
}

