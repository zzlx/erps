// This is a small wrapper around completeValue which detects and logs errors
// in the execution context.

export function completeValueCatchingError(context, returnType, fieldNodes, info, path, result) {
  try {
    let completed;

    if (isPromise(result)) {
      completed = result.then(resolved => {
        return completeValue(context, returnType, fieldNodes, info, path, resolved);
      });
    } else {
      completed = completeValue(context, returnType, fieldNodes, info, path, result);
    }

    if (isPromise(completed)) {
      // Note: we don't rely on a `catch` method, 
      // but we do expect "thenable" to take a second callback for the error case.
      return completed.then(undefined, error => {
        return handleFieldError(error, fieldNodes, path, returnType, context);
      });
    }

    return completed;
  } catch (error) {
    return handleFieldError(error, fieldNodes, path, returnType, context);
  }
}

function handleFieldError(rawError, fieldNodes, path, returnType, context) {
  const error = locatedError(
    asErrorInstance(rawError), 
    fieldNodes, 
    responsePathAsArray(path)
  ); 

  // If the field type is non-nullable, then it is resolved without any
  // protection from errors, however it still properly locates the error.
  if (isNonNullType(returnType)) {
    throw error;
  }

  // Otherwise, error protection is applied, logging the error and resolving
  // a null value for this field if one is encountered.
  context.errors.push(error);
  return null;
}
