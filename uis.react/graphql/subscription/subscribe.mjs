import { iterall } from '../../utils/iterall.mjs';
import { inspect } from '../../utils/inspect.mjs';

import { GraphQLError, locatedError, } from '../error/index.mjs';
import { getOperationRootType } from '../utilities/getOperationRootType.mjs';
import { mapAsyncIterator } from './mapAsyncIterator.mjs';
import { 
  addPath, 
  assertValidExecutionArguments, 
  buildExecutionContext, 
  buildResolveInfo, 
  collectFields, 
  execute, 
  getFieldDef, 
  resolveFieldValueOrError, 
  responsePathAsArray 
} from '../execution/index.mjs';
import { createSourceEventStream } from './createSourceEventStream.mjs';


/**
 * Implements the "Subscribe" algorithm described in the GraphQL specification.
 *
 * Returns a Promise which resolves to either an AsyncIterator (if successful)
 * or an ExecutionResult (client error). The promise will be rejected if a
 * server error occurs.
 *
 * If the client-provided arguments to this function do not result in a
 * compliant subscription, a GraphQL Response (ExecutionResult) with
 * descriptive errors and no data will be returned.
 *
 * If the source stream could not be created due to faulty subscription
 * resolver logic or underlying systems, the promise will resolve to a single
 * ExecutionResult containing `errors` and no `data`.
 *
 * If the operation succeeded, the promise resolves to an AsyncIterator, which
 * yields a stream of ExecutionResults representing the response stream.
 *
 * Accepts either an object with named arguments, or individual arguments.
 */

export function subscribe(
  argsOrSchema, 
  document, 
  rootValue, 
  contextValue, 
  variableValues, 
  operationName, 
  fieldResolver, 
  subscribeFieldResolver
) {
  /* eslint-enable no-redeclare */
  // Extract arguments from object args if provided.
  return arguments.length === 1 
    ? subscribeImpl(
      argsOrSchema.schema, 
      argsOrSchema.document, 
      argsOrSchema.rootValue, 
      argsOrSchema.contextValue, 
      argsOrSchema.variableValues, 
      argsOrSchema.operationName, 
      argsOrSchema.fieldResolver, 
      argsOrSchema.subscribeFieldResolver
    ) 
    : subscribeImpl(
      argsOrSchema, 
      document, 
      rootValue, 
      contextValue, 
      variableValues, 
      operationName, 
      fieldResolver, 
      subscribeFieldResolver
    );
}

/**
 * This function checks if the error is a GraphQLError. 
 * If it is, report it as an ExecutionResult, 
 * containing only errors and no data. 
 * Otherwise treat the error as a system-class error and re-throw it.
 */

function reportGraphQLError(error) {
  if (error instanceof GraphQLError) {
    return {
      errors: [error]
    };
  }

  throw error;
}

function subscribeImpl(
  schema, 
  document, 
  rootValue, 
  contextValue, 
  variableValues, 
  operationName, 
  fieldResolver, 
  subscribeFieldResolver
) {
  const sourcePromise = createSourceEventStream(
    schema, 
    document, 
    rootValue, 
    contextValue, 
    variableValues, 
    operationName, 
    subscribeFieldResolver
  );

  // For each payload yielded from a subscription, map it over the normal
  // GraphQL `execute` function, with `payload` as the rootValue.
  // This implements the "MapSourceToResponseEvent" algorithm described in
  // the GraphQL specification. The `execute` function provides the
  // "ExecuteSubscriptionEvent" algorithm, as it is nearly identical to the
  // "ExecuteQuery" algorithm, for which `execute` is also used.

  const mapSourceToResponse = function mapSourceToResponse(payload) {
    return execute(
      schema, 
      document, 
      payload, 
      contextValue, 
      variableValues, 
      operationName, 
      fieldResolver
    );
  }; 

  // Resolve the Source Stream, then map every source value to a
  // ExecutionResult value as described above.

  return sourcePromise.then(function (resultOrStream) {
    return (
      // Note: Flow can't refine isAsyncIterable, so explicit casts are used.
      iterall.isAsyncIterable(resultOrStream) 
        ? mapAsyncIterator(
          resultOrStream, 
          mapSourceToResponse, 
          reportGraphQLError) 
        : resultOrStream
    );
  }, reportGraphQLError);
}
