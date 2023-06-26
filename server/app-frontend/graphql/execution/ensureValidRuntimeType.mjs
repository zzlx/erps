export function ensureValidRuntimeType(
  runtimeTypeOrName, 
  exeContext, 
  returnType, 
  fieldNodes, 
  info, 
  result
) {
  const runtimeType = typeof runtimeTypeOrName === 'string' 
    ? exeContext.schema.getType(runtimeTypeOrName) 
    : runtimeTypeOrName;

  if (!isObjectType(runtimeType)) {
    throw new GraphQLError(
      "Abstract type ".concat(returnType.name, " must resolve to an Object type at ") + 
      "runtime for field ".concat(info.parentType.name, ".").concat(info.fieldName, " with ") + 
      "value ".concat(inspect(result), ", received \"").concat(inspect(runtimeType), "\". ") + 
      "Either the ".concat(returnType.name, " type should provide a \"resolveType\" ") + 
      'function or each possible type should provide an "isTypeOf" function.', fieldNodes);
  }

  if (!exeContext.schema.isPossibleType(returnType, runtimeType)) {
    throw new GraphQLError(
      "Runtime Object type \""
      .concat(runtimeType.name, "\" is not a possible type ") + 
      "for \""
      .concat(returnType.name, "\"."), 
      fieldNodes
    );
  }

  return runtimeType;
}
