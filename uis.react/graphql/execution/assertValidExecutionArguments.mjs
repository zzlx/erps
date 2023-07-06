/**
 * Essential assertions before executing to provide developer feedback for
 * improper use of the GraphQL library.
 */

import { assert } from '../../utils/assert.mjs';
import { assertValidSchema } from '../type/index.mjs';

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
