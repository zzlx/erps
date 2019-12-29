/**
 * GraphQL
 */

import { validateSchema } from './type/validate.mjs';
import { parse } from './language/parser.mjs';
import { validate } from './validation/validate.mjs';
import { execute } from './execution/execute.mjs';

export function graphql(opts) {
  if (arguments.length > 1) {
    opts = Object.create(null);
    opts.schema = _arguments[0];
    opts.source = _arguments[1];
    opts.rootValue = _arguments[2];
    opts.contextValue = _arguments[3];
    opts.variableValues = _arguments[4];
    opts.operationName = _arguments[5];
    opts.fieldResolver = _arguments[6];
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
  schema, source, rootValue, contextValue, variableValues, operationName, fieldResolver 
) {
  // Validate Schema
  const schemaValidationErrors = validateSchema(schema);

  if (schemaValidationErrors.length > 0) {
    return {
      errors: schemaValidationErrors
    };
  } 

  let document;
  try {
    // Parse 
    document = parse(source);
  } catch (syntaxError) {
    return {
      errors: [syntaxError]
    };
  } 

  // Validate
  const validationErrors = validate(schema, document);

  if (validationErrors.length > 0) return { errors: validationErrors };

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
