/**
 * *****************************************************************************
 *
 * execute
 *
 * *****************************************************************************
 */

import { buildExecutionContext } from './buildExecutionContext.mjs';

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
  if (Array.isArray(exeContext)) { return { errors: exeContext }; } 

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
