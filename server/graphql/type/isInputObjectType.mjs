/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { GraphQLInputObjectType } from './GraphQLInputObjectType.mjs';

export function isInputObjectType(type) {
  return type instanceof GraphQLInputObjectType;
}

