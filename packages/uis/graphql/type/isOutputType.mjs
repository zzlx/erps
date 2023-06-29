/**
 * These types may be used as output types as the result of fields.
 */

import { isScalarType } from './isScalarType.mjs';
import { isObjectType } from './isObjectType.mjs';
import { isInterfaceType } from './isInterfaceType.mjs';
import { isUnionType } from './isUnionType.mjs';
import { isEnumType } from './isEnumType.mjs';
import { isWrappingType } from './isWrappingType.mjs';

export function isOutputType(type) {
  return isScalarType(type) || 
    isObjectType(type) || 
    isInterfaceType(type) || 
    isUnionType(type) || 
    isEnumType(type) || 
    isWrappingType(type) && 
    isOutputType(type.ofType);
}
