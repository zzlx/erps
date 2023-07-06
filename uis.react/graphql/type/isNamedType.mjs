/**
 * These named types do not include modifiers like List or NonNull.
 */

import { isScalarType } from './isScalarType.mjs';
import { isObjectType } from './isObjectType.mjs';
import { isInterfaceType } from './isInterfaceType.mjs';
import { isUnionType } from './isUnionType.mjs';
import { isEnumType } from './isEnumType.mjs';
import { isInputObjectType } from './isInputObjectType.mjs';

export function isNamedType(type) {
  return isScalarType(type) || 
    isObjectType(type) || 
    isInterfaceType(type) || 
    isUnionType(type) || 
    isEnumType(type) || 
    isInputObjectType(type);
}
