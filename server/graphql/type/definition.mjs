/**
 * *****************************************************************************
 *
 *
 *
 * *****************************************************************************
 */

import { 
  assert, 
  inspect,
  defineToStringTag,
  defineToJSON,
  objectSpread as _objectSpread,
  keyMap,
  mapValue,
  isPlainObject as isPlainObj,
} from '../../utils.lib.mjs';

import { valueFromASTUntyped } from '../utilities/valueFromASTUntyped.mjs';

import { isScalarType } from './GraphQLScalarType.mjs';

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

export function assertType(type) {
  assert(isType(type), "Expected ".concat(inspect(type), " to be a GraphQL type."));
  return type;
}

/**
 * These types may be used as input types for arguments and directives.
 */

export function isInputType(type) {
  return isScalarType(type) || 
    isEnumType(type) || 
    isInputObjectType(type) || 
    isWrappingType(type) && isInputType(type.ofType);
}

export function assertInputType(type) {
  assert(
    isInputType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL input type.")
  );
  return type;
}

/**
 * These types may be used as output types as the result of fields.
 */

export function isOutputType(type) {
  return isScalarType(type) || 
    isObjectType(type) || 
    isInterfaceType(type) || 
    isUnionType(type) || 
    isEnumType(type) || 
    isWrappingType(type) && 
    isOutputType(type.ofType);
}

export function assertOutputType(type) {
  assert(
    isOutputType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL output type.")
  );
  return type;
}

/**
 * These types may describe types which may be leaf values.
 */

export function isLeafType(type) {
  return isScalarType(type) || isEnumType(type);
}

export function assertLeafType(type) {
  assert(
    isLeafType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL leaf type.")
  );
  return type;
}

/**
 * These types may describe the parent context of a selection set.
 */

export function isCompositeType(type) {
  return isObjectType(type) || isInterfaceType(type) || isUnionType(type);
}

export function assertCompositeType(type) {
  assert( 
    isCompositeType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL composite type.")
  );
  return type;
}

/**
 * These types may describe the parent context of a selection set.
 */

export function isAbstractType(type) {
  return isInterfaceType(type) || isUnionType(type);
}

export function assertAbstractType(type) {
  assert(
    isAbstractType(type),
    "Expected ".concat(inspect(type), " to be a GraphQL abstract type.")
  );

  return type;
}

/**
 * These types wrap and modify other types
 */

export function isWrappingType(type) {
  return isListType(type) || isNonNullType(type);
}

export function assertWrappingType(type) {
  assert(
    isWrappingType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL wrapping type.")
  );
  return type;
}


/**
 * These named types do not include modifiers like List or NonNull.
 */

export function isNamedType(type) {
  return isScalarType(type) || 
    isObjectType(type) || 
    isInterfaceType(type) || 
    isUnionType(type) || 
    isEnumType(type) || 
    isInputObjectType(type);
}

export function assertNamedType(type) {
  assert(
    isNamedType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL named type.")
  );
  return type;
}

export function getNamedType(type) {
  if (type) {
    let unwrappedType = type;

    while (isWrappingType(unwrappedType)) {
      unwrappedType = unwrappedType.ofType;
    }

    return unwrappedType;
  }
}

export function isRequiredArgument(arg) {
  return isNonNullType(arg.type) && arg.defaultValue === undefined;
}


export function isRequiredInputField(field) {
  return isNonNullType(field.type) && field.defaultValue === undefined;
}
