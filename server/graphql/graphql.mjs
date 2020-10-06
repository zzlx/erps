/**
 * GraphQL
 *
 */

import { validateSchema } from './type/validate.mjs';
import { parse } from './language/parser.mjs';
import { validate } from './validation/validate.mjs';
import { execute } from './execution/execute.mjs';

export function graphql(opts) {

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

function graphqlImpl(
  schema, 
  source, 
  rootValue, 
  contextValue, 
  variableValues, 
  operationName, 
  fieldResolver 
) {
  let document = null;

  // Validate Schema
  const schemaValidationErrors = validateSchema(schema);

  if (schemaValidationErrors.length > 0) {
    return { errors: schemaValidationErrors };
  } 

  try {
    document = parse(source);
  } catch (syntaxError) {
    return { errors: [syntaxError] };
  } 

  // Validate
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
