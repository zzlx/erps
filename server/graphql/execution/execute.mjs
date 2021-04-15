/**
 * *****************************************************************************
 *
 * execute
 * 执行graphql查询
 *
 * @file execute.mjs
 * *****************************************************************************
 */

import { 
  assert, inspect, forEach, 
  isCollection, 
  isPromise, 
  isNullish,
  isInvalid,
} from '../../utils.lib.mjs';
import memoize3 from '../utilities/memoize3.mjs';
import promiseForObject from '../utilities/promiseForObject.mjs';
import promiseReduce from '../utilities/promiseReduce.mjs';
import { GraphQLError, locatedError, } from '../error/index.mjs';
import { getOperationRootType } from '../utilities/getOperationRootType.mjs';
import { typeFromAST } from '../utilities/typeFromAST.mjs';
import { Kind } from '../language/kinds.mjs';
import { 
  getVariableValues, getArgumentValues, getDirectiveValues 
} from './values.mjs';

import { 
  isObjectType, 
	isAbstractType, 
	isLeafType, 
	isListType, 
	isNonNullType 
} from '../type/definition.mjs';

import { 
  SchemaMetaFieldDef, TypeMetaFieldDef, TypeNameMetaFieldDef 
} from '../type/introspection.mjs';

import { 
  GraphQLIncludeDirective, GraphQLSkipDirective 
} from '../type/directives.mjs';

import { assertValidSchema } from '../type/validate.mjs';

export function execute(
  schema,
  document,
  rootValue,
  contextValue, 
  variableValues, 
  operationName, 
  fieldResolver
) {
  // If arguments are missing or incorrect, throw an error.
  assertValidExecutionArguments(schema, document, variableValues); 

  // If a valid execution context cannot be created due to incorrect arguments,
  // a "Response" with only errors is returned.
  const exeContext = buildExecutionContext(
    schema, 
    document, 
    rootValue, 
    contextValue, 
    variableValues, 
    operationName, 
    fieldResolver
  ); 

  // Return early errors if execution context failed.
  if (Array.isArray(exeContext)) {
    return { errors: exeContext };
  } 

  // Return a Promise that will eventually resolve to the data described by
  // The "Response" section of the GraphQL specification.
  //
  // If errors are encountered while executing a GraphQL field, 
  // only that field and its descendants will be omitted, 
  // and sibling fields will still be executed. 
  // execution which encounters errors will still result in a resolved Promise.
  const data = executeOperation(exeContext, exeContext.operation, rootValue);

  return buildResponse(exeContext, data);
}

/**
 * Given a completed execution context and data, 
 * build the response defined by the "Response" section of the GraphQL specification.
 */

function buildResponse(exeContext, data) {
  if (isPromise(data)) {
    return data.then(resolved => buildResponse(exeContext, resolved));
  }

  return exeContext.errors.length === 0 
    ? { data: data } 
    : { errors: exeContext.errors, data: data };
}

/**
 * Given a ResponsePath 
 * (found in the `path` entry,
 * in the information provided as the last argument to a field resolver), 
 * return an Array of the path keys.
 */

export function responsePathAsArray(path) {
  const flattened = [];
  let curr = path;

  while (curr) {
    flattened.push(curr.key);
    curr = curr.prev;
  }

  return flattened.reverse();
}

/**
 * Return a new ResponsePath containing the new key.
 */

export function addPath(prev, key) {
  return { prev: prev, key: key };
}

/**
 * Essential assertions before executing to provide developer feedback for
 * improper use of the GraphQL library.
 */

export function assertValidExecutionArguments(schema, document, rawVariableValues) { 
  // If the schema used for execution is invalid, throw an error.
  assertValidSchema(schema);

  assert(document, 'document argument is nedded.');

  // Variables, if provided, must be an object.
  assert(
    !rawVariableValues || typeof(rawVariableValues) === 'object',
    'Variables must be provided as an Object where each property is a variable value. ' + 
    'Perhaps look to see if an unparsed JSON string was provided.'
  ); 
}

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

/**
 * Implements the "Evaluating operations" section of the spec.
 */

function executeOperation(exeContext, operation, rootValue) {
  const type = getOperationRootType(exeContext.schema, operation);

  const fields = collectFields(
    exeContext, 
    type, 
    operation.selectionSet, 
    Object.create(null), 
    Object.create(null)
  );

  let path = undefined; 

  // Errors from sub-fields of a NonNull type may propagate to the top level,
  // at which point we still log the error and null the parent field, which
  // in this case is the entire response.
  // Similar to completeValueCatchingError.
  try {
    // 并行执行查询，序列化执行变更操作，以避免竞态
    const result = operation.operation === 'mutation' 
      ? executeFieldsSerially(exeContext, type, rootValue, path, fields) 
      : executeFields(exeContext, type, rootValue, path, fields);

    if (isPromise(result)) {
      return result.then(undefined, (error) => {
        exeContext.errors.push(error);
        return Promise.resolve(null);
      });
    }

    return result;
  } catch (error) {
    exeContext.errors.push(error);
    return null;
  }
}

/**
 * Implements the "Evaluating selection sets" section of the spec for "write" mode.
 */

function executeFieldsSerially(context, parentType, rootValue, path, fields) {
  return promiseReduce(Object.keys(fields), (results, field) => {
    const fieldNodes = fields[field];
    const fieldPath = addPath(path, field);

    const result = resolveField(
      context, 
      parentType, 
      rootValue, 
      fieldNodes, 
      fieldPath
    );

    if (result === undefined) { return results; }

    if (isPromise(result)) {
      return result.then((resolvedResult) => {
        results[responseName] = resolvedResult;
        return results;
      });
    }

    results[field] = result;
    return results;
  }, Object.create(null));
}

/**
 * Implements the "Evaluating selection sets" section of the spec for "read" mode.
 */

function executeFields(exeContext, parentType, rootValue, path, fields) {
  const results = Object.create(null);
  let containsPromise = false;

  for (let i = 0, keys = Object.keys(fields); i < keys.length; ++i) {
    const field = keys[i];
    const fieldNodes = fields[field];
    const fieldPath = addPath(path, field);

    const result = resolveField(
      exeContext, 
      parentType, 
      rootValue, 
      fieldNodes, 
      fieldPath
    );

    if (result !== undefined) {
      results[field] = result;

      if (!containsPromise && isPromise(result)) {
        containsPromise = true;
      }
    }
  } 

  // If there are no promises, we can just return the object
  if (!containsPromise) {
    return results;
  } 

  // Otherwise, 
  // results is a map from field name to the result of resolving that field, 
  // which is possibly a promise. 
  // Return a promise that will return this same map, 
  // but with any promises replaced with the values they resolved to.
  return promiseForObject(results);
}

/**
 * Given a selectionSet, 
 * adds all of the fields in that selection to the passed in map of fields, 
 * and returns it at the end.
 *
 * CollectFields requires the "runtime type" of an object. 
 * For a field which returns an Interface or Union type, 
 * the "runtime type" will be the actual Object type returned by that field.
 */

export function collectFields(
  exeContext, 
  runtimeType, 
  selectionSet, 
  fields, 
  visitedFragmentNames
) {
  for (let i = 0; i < selectionSet.selections.length; i++) {
    const selection = selectionSet.selections[i];

    switch (selection.kind) {
      case Kind.FIELD:
        if (!shouldIncludeNode(exeContext, selection)) {
          continue;
        }

        const name = getFieldEntryKey(selection);

        if (!fields[name]) {
          fields[name] = [];
        }

        fields[name].push(selection);
        break;

      case Kind.INLINE_FRAGMENT:
        if (!shouldIncludeNode(exeContext, selection) || 
            !doesFragmentConditionMatch(exeContext, selection, runtimeType)
        ) {
          continue;
        }

        collectFields(
          exeContext, 
          runtimeType, 
          selection.selectionSet, 
          fields, 
          visitedFragmentNames
        );
        break;

      case Kind.FRAGMENT_SPREAD:
        const fragName = selection.name.value;

        if (visitedFragmentNames[fragName] || 
          !shouldIncludeNode(exeContext, selection)
        ) {
          continue;
        }

        visitedFragmentNames[fragName] = true;
        const fragment = exeContext.fragments[fragName];

        if (!fragment || 
          !doesFragmentConditionMatch(exeContext, fragment, runtimeType)
        ) {
          continue;
        }

        collectFields(
          exeContext, 
          runtimeType, 
          fragment.selectionSet, 
          fields, 
          visitedFragmentNames
        );
        break;
    }
  }

  return fields;
}

/**
 * Determines if a field should be included,
 * based on the @include and @skip directives, 
 * where @skip has higher precedence(优先) than @include.
 */

function shouldIncludeNode(exeContext, node) {
  const skip = getDirectiveValues(
    GraphQLSkipDirective, 
    node, 
    exeContext.variableValues
  );

  if (skip && skip.if === true) {
    return false;
  }

  const include = getDirectiveValues(
    GraphQLIncludeDirective, 
    node, 
    exeContext.variableValues
  );

  if (include && include.if === false) { return false; }

  return true;
}

/**
 * Determines if a fragment is applicable to the given type.
 */

function doesFragmentConditionMatch(exeContext, fragment, type) {
  const typeConditionNode = fragment.typeCondition;

  if (!typeConditionNode) {
    return true;
  }

  const conditionalType = typeFromAST(exeContext.schema, typeConditionNode);

  if (conditionalType === type) {
    return true;
  }

  if (isAbstractType(conditionalType)) {
    return exeContext.schema.isPossibleType(conditionalType, type);
  }

  return false;
}

/**
 * Implements the logic to compute the key of a given field's entry
 */

function getFieldEntryKey(node) {
  return node.alias ? node.alias.value : node.name.value;
}

/**
 * Resolves the field on the given source object. 
 * In particular, 
 * this figures out the value that the field returns by calling its resolve function,
 * then calls completeValue to complete promises, serialize scalars, 
 * or execute the sub-selection-set for objects.
 */

function resolveField(exeContext, parentType, rootValue, fieldNodes, path) {
  const fieldNode = fieldNodes[0];
  const fieldName = fieldNode.name.value;
  const fieldDef = getFieldDef(exeContext.schema, parentType, fieldName);

  if (!fieldDef) {
    return;
  }

  // fieldDef.resolve || fieldResolver
  // @todo: 如何使用resolver
  const resolveFn = fieldDef.resolve || exeContext.fieldResolver[parentType][fieldName];
  const info = buildResolveInfo(exeContext, fieldDef, fieldNodes, parentType, path); 

  // Get the resolve function, regardless of if its result is normal or abrupt.
  const result = resolveFieldValueOrError(
    exeContext, 
    fieldDef, 
    fieldNodes, 
    resolveFn, 
    rootValue, 
    info
  );

  return completeValueCatchingError(
    exeContext, 
    fieldDef.type, 
    fieldNodes, 
    info, 
    path, 
    result
  );
}

export function buildResolveInfo(context, fieldDef, fieldNodes, parentType, path) {
  // The resolve function's optional fourth argument,
  // that is a collection of information about the current execution state.
  return {
    fieldName: fieldDef.name,
    fieldNodes: fieldNodes,
    returnType: fieldDef.type,
    parentType: parentType,
    path: path,
    schema: context.schema,
    fragments: context.fragments,
    rootValue: context.rootValue,
    operation: context.operation,
    variableValues: context.variableValues
  };
} 

// Isolates the "ReturnOrAbrupt" behavior to not de-opt the `resolveField`
// function. Returns the result of resolveFn or the abrupt-return Error object.
export function resolveFieldValueOrError(
  exeContext, fieldDef, fieldNodes, resolveFn, rootValue, info
) {
  try {
    // Build a JS object of arguments from the field.arguments AST, using the
    // variables scope to fulfill any variable references.
    // TODO: find a way to memoize, in case this field is within a List type.
    const args = getArgumentValues(fieldDef, fieldNodes[0], exeContext.variableValues); 

    // The resolve function's optional third argument is a context value 
    // that is provided to every resolve function within an execution. 
    // It is commonly used to represent an authenticated user, 
    // or request-specific caches.
    const _contextValue = exeContext.contextValue;

    // 执行resolve函数
    const result = resolveFn(rootValue, args, _contextValue, info);

    // 处理潜在的promise result
    return isPromise(result)? result.then(undefined, asErrorInstance) : result;

  } catch (error) {
    return asErrorInstance(error);
  }
} 

// Sometimes a non-error is thrown, wrap it as an Error instance to ensure a
// consistent Error interface.

function asErrorInstance(error) {
  return error instanceof Error ? error : new Error(error || undefined);
} 

// This is a small wrapper around completeValue which detects and logs errors
// in the execution context.

function completeValueCatchingError(context, returnType, fieldNodes, info, path, result) {
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

/**
 * Implements the instructions for completeValue as defined in the
 * "Field entries" section of the spec.
 *
 * If the field type is Non-Null, then this recursively completes the value
 * for the inner type. It throws a field error if that completion returns null,
 * as per the "Nullability" section of the spec.
 *
 * If the field type is a List, then this recursively completes the value
 * for the inner type on each item in the list.
 *
 * If the field type is a Scalar or Enum, ensures the completed value is a legal
 * value of the type by calling the `serialize` method of GraphQL type
 * definition.
 *
 * If the field is an abstract type, determine the runtime type of the value
 * and then complete based on that type
 *
 * Otherwise, the field type expects a sub-selection set, and will complete the
 * value by evaluating all sub-selections.
 */

function completeValue(context, returnType, fieldNodes, info, path, result) {
  // If result is an Error, throw a located error.
  if (result instanceof Error) {
    throw result;
  } // If field type is NonNull, complete for inner type, and throw field error
  // if result is null.


  if (isNonNullType(returnType)) {
    const completed = completeValue(
      context, 
      returnType.ofType, 
      fieldNodes, 
      info, 
      path, 
      result
    );

    if (completed === null) {
      throw new Error(
        "Cannot return null for non-nullable field ".concat(info.parentType.name, ".").concat(info.fieldName, ".")
      );
    }

    return completed;
  } // If result value is null-ish (null, undefined, or NaN) then return null.


  if (isNullish(result)) {
    return null;
  } // If field type is List, complete each item in the list with the inner type


  if (isListType(returnType)) {
    return completeListValue(
      context, 
      returnType, 
      fieldNodes, 
      info, 
      path, 
      result
    );
  } // If field type is a leaf type, Scalar or Enum, serialize to a valid value,
  // returning null if serialization is not possible.


  if (isLeafType(returnType)) {
    return completeLeafValue(returnType, result);
  } 

  // If field type is an abstract type, Interface or Union, determine the
  // runtime Object type and complete for that type.
  if (isAbstractType(returnType)) {
    return completeAbstractValue(
      context, 
      returnType, 
      fieldNodes, 
      info, 
      path, 
      result
    );
  } 

  // If field type is Object, execute and complete all sub-selections.
  if (isObjectType(returnType)) {
    return completeObjectValue(context, returnType, fieldNodes, info, path, result);
  } 

  // Not reachable. All possible output types have been considered.
  /* istanbul ignore next */

  throw new Error(
    `Cannot complete value of unexpected type "${inspect(returnType)}".`
  );
}

/**
 * Complete a list value by completing each item in the list with the
 * inner type
 */

function completeListValue(context, returnType, fieldNodes, info, path, result) {
  assert(
    isCollection(result), 
    "Expected Iterable, but did not find one for field ".concat(info.parentType.name, ".").concat(info.fieldName, ".")
  );

  // This is specified as a simple map, however we're optimizing the path
  // where the list contains no Promises by avoiding creating another Promise.

  var itemType = returnType.ofType;
  var containsPromise = false;
  var completedResults = [];
  forEach(result, function (item, index) {
    // No need to modify the info object containing the path,
    // since from here on it is not ever accessed by resolver functions.
    var fieldPath = addPath(path, index);
    var completedItem = completeValueCatchingError(context, itemType, fieldNodes, info, fieldPath, item);

    if (!containsPromise && isPromise(completedItem)) {
      containsPromise = true;
    }

    completedResults.push(completedItem);
  });
  return containsPromise ? Promise.all(completedResults) : completedResults;
}

/**
 * Complete a Scalar or Enum by serializing to a valid value,
 * returning null if serialization is not possible.
 */

function completeLeafValue(returnType, result) {
  assert(returnType.serialize, 'Missing serialize method on type.');

  const serializedResult = returnType.serialize(result);

  if (isInvalid(serializedResult)) {
    throw new Error(
      `Expected a value of type ${inspect(returnType)} but received: ${inspect(result)}`
    );
  }

  return serializedResult;
}

/**
 * Complete a value of an abstract type by determining the runtime object type
 * of that value, then complete the value for that type.
 */

function completeAbstractValue(context, returnType, fieldNodes, info, path, result) {
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

function ensureValidRuntimeType(
  runtimeTypeOrName, exeContext, returnType, fieldNodes, info, result
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

/**
 * Complete an Object value by executing all sub-selections.
 */

function completeObjectValue(context, returnType, fieldNodes, info, path, result) {
  // If there is an isTypeOf predicate function, call it with the
  // current result. If isTypeOf returns false, then raise an error rather
  // than continuing execution.
  if (returnType.isTypeOf) {
    const isTypeOf = returnType.isTypeOf(result, context.contextValue, info);

    if (isPromise(isTypeOf)) {
      return isTypeOf.then((resolvedIsTypeOf) => {
        if (!resolvedIsTypeOf) {
          throw invalidReturnTypeError(returnType, result, fieldNodes);
        }

        return collectAndExecuteSubfields(context, returnType, fieldNodes, path, result);
      });
    }

    if (!isTypeOf) {
      throw invalidReturnTypeError(returnType, result, fieldNodes);
    }
  }

  return collectAndExecuteSubfields(context, returnType, fieldNodes, path, result);
}

function invalidReturnTypeError(returnType, result, fieldNodes) {
  return new GraphQLError(
    "Expected value of type \"".concat(returnType.name, "\" but got: ").concat(inspect(result), "."), 
    fieldNodes
  );
}

function collectAndExecuteSubfields(context, returnType, fieldNodes, path, result) {
  // Collect sub-fields to execute to complete this value.
  const subFieldNodes = collectSubfields(context, returnType, fieldNodes);
  return executeFields(context, returnType, result, path, subFieldNodes);
}

/**
 * A memoized collection of relevant subfields with regard to the return type.
 * Memoizing ensures the subfields are not repeatedly calculated, 
 * which saves overhead when resolving lists of values.
 */

const collectSubfields = memoize3(_collectSubfields);

function _collectSubfields(context, returnType, fieldNodes) {
  let subFieldNodes = Object.create(null);
  const visitedFragmentNames = Object.create(null);

  for (let i = 0; i < fieldNodes.length; i++) {
    const selectionSet = fieldNodes[i].selectionSet;

    if (selectionSet) {
      subFieldNodes = collectFields(
        context, returnType, selectionSet, subFieldNodes, visitedFragmentNames
      );
    }
  }

  return subFieldNodes;
}

/**
 * If a resolveType function is not given, 
 * then a default resolve behavior is used which attempts two strategies:
 *
 * First, See if the provided value has a `__typename` field defined, if so, use
 * that value as name of the resolved type.
 *
 * Otherwise, test each possible type for the abstract type by calling
 * isTypeOf for the object being coerced, returning the first type that matches.
 */


function defaultResolveTypeFn(value, contextValue, info, abstractType) {
  // First, look for `__typename`.
  if (
    value !== null && 
    typeof(value) === 'object' && 
    typeof value.__typename === 'string'
  ) {
    return value.__typename;
  } 

  // Otherwise, test each possible type.
  const possibleTypes = info.schema.getPossibleTypes(abstractType);
  const promisedIsTypeOfResults = [];

  for (let i = 0; i < possibleTypes.length; i++) {
    const type = possibleTypes[i];

    if (type.isTypeOf) {
      const isTypeOfResult = type.isTypeOf(value, contextValue, info);

      if (isPromise(isTypeOfResult)) {
        promisedIsTypeOfResults[i] = isTypeOfResult;
      } else if (isTypeOfResult) {
        return type;
      }
    }
  }

  if (promisedIsTypeOfResults.length) {
    return Promise.all(promisedIsTypeOfResults).then(function (isTypeOfResults) {
      for (let _i = 0; _i < isTypeOfResults.length; _i++) {
        if (isTypeOfResults[_i]) {
          return possibleTypes[_i];
        }
      }
    });
  }
}

/**
 * If a resolve function is not given, then a default resolve behavior is used
 * which takes the property of the source object of the same name as the field
 * and returns it as the result, or if it's a function, returns the result
 * of calling that function while passing along args and context value.
 */

export function defaultFieldResolver(source, args, contextValue, info) {
  // ensure source is a value for which property access is acceptable.
  if (typeof source === 'object' || typeof source === 'function') {
    const property = source[info.fieldName];

    if (typeof property === 'function') {
      return source[info.fieldName](args, contextValue, info);
    }

    return property;
  }
}

/**
 * This method looks up the field on the given type definition.
 * It has two special casing for the introspection fields:
 * 1. __typename is special because it can always be queried as a field, 
 * even in situations where no other fields are allowed, like on a Union.
 * 2. __schema could get automatically added to the query type, 
 * but that would require mutating type definitions, which would cause issues.
 */

export function getFieldDef(schema, parentType, fieldName) {
  if (
    fieldName === SchemaMetaFieldDef.name && 
    schema.getQueryType() === parentType
  ) {
    return SchemaMetaFieldDef;
  } else if (
    fieldName === TypeMetaFieldDef.name && schema.getQueryType() === parentType
  ) {
    return TypeMetaFieldDef;
  } else if (fieldName === TypeNameMetaFieldDef.name) {
    return TypeNameMetaFieldDef;
  }

  return parentType.getFields()[fieldName];
}
