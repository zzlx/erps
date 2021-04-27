/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { GraphQLInterfaceType } from './GraphQLInterfaceType.mjs';

// eslint-disable-next-line no-redeclare
export function isInterfaceType(type) {
  return type instanceof GraphQLInterfaceType;
}

