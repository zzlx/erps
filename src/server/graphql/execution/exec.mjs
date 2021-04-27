/**
 * *****************************************************************************
 *
 * [GraphQL](https://spec.graphql.org/draft/)
 *
 *
 * *****************************************************************************
 */

import { parse } from '../language/index.mjs';
import { validateSchema } from '../type/index.mjs';
import { validate } from '../validation/index.mjs';
import { execute } from './execute.mjs';

export function exec(opts) {
  if (arguments.length > 1) {
    opts = Object.create(null);
    opts.schema = arguments[0];
    opts.source = arguments[1];
    opts.rootValue = arguments[2];
    opts.contextValue = arguments[3];
    opts.variableValues = arguments[4];
    opts.operationName = arguments[5];
    opts.fieldResolver = arguments[6];
  }

  // Always return a Promise for a consistent API.
  return new Promise(resolve => resolve(graphqlImpl(
    opts.schema, 
    opts.source, 
    opts.rootValue, 
    opts.contextValue, 
    opts.variableValues, 
    opts.operationName, 
    opts.fieldResolver
  )));
}

/**
 *
 *
 *
 *
 */

let isSchemaValid = false; // schema validation状态

function graphqlImpl (
  schema, 
  source, 
  rootValue, 
  contextValue, 
  variableValues, 
  operationName, 
  fieldResolver 
) {
  let document = null;

  // Validate Schema just once
  const schemaValidationErrors = isSchemaValid ? [] : validateSchema(schema);
  if (isSchemaValid === false) isSchemaValid = true;

  if (schemaValidationErrors.length > 0) {
    return { errors: schemaValidationErrors };
  } 

  try {
    document = parse(source);
  } catch (syntaxError) {
    return { errors: [syntaxError] };
  } 

  // Validate document
  const validationErrors = validate(schema, document);

  if (validationErrors.length > 0) {
    return { errors: validationErrors };
  }

  // Execute
  return execute(
    schema, 
    document, 
    rootValue, 
    contextValue, 
    variableValues, 
    operationName, 
    fieldResolver
  );
}
