export function isChangeSafeForInputObjectFieldOrFieldArg(oldType, newType) {
  if (isNamedType(oldType)) {
    // if they're both named types, see if their names are equivalent
    return isNamedType(newType) && oldType.name === newType.name;
  } else if (isListType(oldType)) {
    // if they're both lists, make sure the underlying types are compatible
    return isListType(newType) && isChangeSafeForInputObjectFieldOrFieldArg(oldType.ofType, newType.ofType);
  } else if (isNonNullType(oldType)) {
    return (// if they're both non-null, make sure the underlying types are
      // compatible
      isNonNullType(newType) && isChangeSafeForInputObjectFieldOrFieldArg(oldType.ofType, newType.ofType) || // moving from non-null to nullable of the same underlying type is safe
      !isNonNullType(newType) && isChangeSafeForInputObjectFieldOrFieldArg(oldType.ofType, newType)
    );
  }

  return false;
}
