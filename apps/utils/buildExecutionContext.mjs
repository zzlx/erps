/**
 * Constructs a ExecutionContext object from the arguments passed to execute, 
 * which we will pass throughout the other execution methods.
 *
 * Throws a GraphQLError if a valid execution context cannot be created.
 */

export function buildExecutionContext(
  schema, 
  document, 
  rootValue, 
  contextValue, 
  rawVariableValues, 
  operationName, 
  fieldResolver
) {
  const errors = [];

  let operation;
  let hasMultipleAssumedOperations = false; // 
  let fragments = Object.create(null);

  for (let i = 0; i < document.definitions.length; i++) {
    const definition = document.definitions[i];

    switch (definition.kind) {
      case Kind.OPERATION_DEFINITION:
        if (!operationName && operation) {
          hasMultipleAssumedOperations = true;
        } else if (
          !operationName || 
          (definition.name && definition.name.value === operationName)
        ) {
          operation = definition;
        }

        break;
      case Kind.FRAGMENT_DEFINITION:
        fragments[definition.name.value] = definition;
        break;
    }
  }

  if (!operation) {
    if (operationName) {
      errors.push(new GraphQLError(
        "Unknown operation named \"".concat(operationName, "\".")
      ));
    } else {
      errors.push(new GraphQLError('Must provide an operation.'));
    }
  } else if (hasMultipleAssumedOperations) {
    errors.push(new GraphQLError(
      'Must provide operation name if query contains multiple operations.'
    ));
  }

  let variableValues;

  if (operation) {
    // coerced
    const coercedVariableValues = getVariableValues(
      schema, 
      operation.variableDefinitions || [], 
      rawVariableValues || {}
    );

    if (coercedVariableValues.errors) {
      errors.push.apply(errors, coercedVariableValues.errors);
    } else {
      variableValues = coercedVariableValues.coerced;
    }
  }

  if (errors.length !== 0) {
    return errors;
  }

  // assert
  assert(operation, 'Has operation if no errors.');
  assert(variableValues, 'Has variables if no errors.');

  return {
    schema: schema,
    fragments: fragments,
    rootValue: rootValue,
    contextValue: contextValue,
    operation: operation,
    variableValues: variableValues,
    fieldResolver: fieldResolver || defaultFieldResolver,
    errors: errors
  };
}

