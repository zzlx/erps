export function typeKindName(type) {
  if (isScalarType(type)) { return 'a Scalar type'; }
  if (isObjectType(type)) { return 'an Object type'; }
  if (isInterfaceType(type)) { return 'an Interface type'; }
  if (isUnionType(type)) { return 'a Union type'; }
  if (isEnumType(type)) { return 'an Enum type'; }
  if (isInputObjectType(type)) { return 'an Input type'; }

  throw new TypeError('Unknown type ' + type.constructor.name);
}
