/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { GraphQLList } from './GraphQLList.mjs';

// eslint-disable-next-line no-redeclare
export function isListType(type) {
  return type instanceof GraphQLList;
}
