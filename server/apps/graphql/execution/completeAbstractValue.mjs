/**
 * Complete a value of an abstract type by determining the runtime object type
 * of that value, then complete the value for that type.
 */

import { isPromise } from '../../utils/isPromise.mjs';
import { ensureValidRuntimeType } from './ensureValidRuntimeType.mjs';
import { completeObjectValue } from './completeObjectValue.mjs';

export function completeAbstractValue(context, returnType, fieldNodes, info, path, result) {
  const runtimeType = returnType.resolveType 
    ? returnType.resolveType(result, context.contextValue, info) 
    : defaultResolveTypeFn(result, context.contextValue, info, returnType);

  if (isPromise(runtimeType)) {
    return runtimeType.then((resolvedRuntimeType) => {
      return completeObjectValue(
        context, 
        ensureValidRuntimeType(
          resolvedRuntimeType, context, returnType, fieldNodes, info, result
        ), 
        fieldNodes, 
        info, 
        path, 
        result
      );
    });
  }

  return completeObjectValue(
    context, 
    ensureValidRuntimeType(
      runtimeType, context, returnType, fieldNodes, info, result
    ), 
    fieldNodes, 
    info, 
    path, 
    result
  );
}
