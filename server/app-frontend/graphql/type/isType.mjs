/**
 * *****************************************************************************
 *
 *
 *
 * *****************************************************************************
 */

import { isScalarType } from './isScalarType.mjs';
import { isObjectType } from './isObjectType.mjs';
import { isInterfaceType } from './isInterfaceType.mjs';
import { isUnionType } from './isUnionType.mjs';
import { isEnumType } from './isEnumType.mjs';
import { isInputObjectType } from './isInputObjectType.mjs';
import { isListType } from './isListType.mjs';
import { isNonNullType } from './isNonNullType.mjs';

export function isType(type) {
  return isScalarType(type) || 
    isObjectType(type) || 
    isInterfaceType(type) || 
    isUnionType(type) || 
    isEnumType(type) || 
    isInputObjectType(type) || 
    isListType(type) || 
    isNonNullType(type);
}
