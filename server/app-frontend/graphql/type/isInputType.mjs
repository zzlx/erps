/**
 * These types may be used as input types for arguments and directives.
 */

import { isScalarType } from './isScalarType.mjs'
import { isEnumType } from './isEnumType.mjs'
import { isInputObjectType } from './isInputObjectType.mjs'
import { isWrappingType } from './isWrappingType.mjs'

export function isInputType(type) {
  return isScalarType(type) || 
    isEnumType(type) || 
    isInputObjectType(type) || 
    isWrappingType(type) && isInputType(type.ofType);
}
