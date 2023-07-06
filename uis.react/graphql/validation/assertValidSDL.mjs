/**
 * Implements the "Validation" section of the spec.
 *
 * Validation runs synchronously, returning an array of encountered errors, or
 * an empty array if no errors were encountered and the document is valid.
 *
 * A list of specific validation rules may be provided. If not provided, the
 * default list of rules defined by the GraphQL specification will be used.
 *
 * Each validation rules is a function which returns a visitor
 * (see the language/visitor API). Visitor methods are expected to return
 * GraphQLErrors, or Arrays of GraphQLErrors when invalid.
 *
 * Optionally a custom TypeInfo instance may be provided. If not provided, one
 * will be created from the provided schema.
 *
 */

import { visit, visitInParallel, visitWithTypeInfo } from '../language/index.mjs';
import { assertValidSchema } from '../type/index.mjs';
import { TypeInfo } from '../utilities/index.mjs';
import { specifiedRules } from './specifiedRules.mjs';
import { specifiedSDLRules } from './specifiedSDLRules.mjs';
import { SDLValidationContext, ValidationContext } from './ValidationContext.mjs';

export function validate(schema, documentAST) {
  var rules = arguments.length > 2 && arguments[2] !== undefined 
    ? arguments[2] : specifiedRules;
  var typeInfo = arguments.length > 3 && arguments[3] !== undefined 
    ? arguments[3] : new TypeInfo(schema);
	if (!documentAST) {
		// If the schema used for validation is invalid, throw an error.
		throw new Error('Must provide document.');
	}


  assertValidSchema(schema);

  var context = new ValidationContext(schema, documentAST, typeInfo); // This uses a specialized visitor which runs multiple visitors in parallel,
  // while maintaining the visitor skip and break API.

  var visitor = visitInParallel(rules.map(function (rule) {
    return rule(context);
  })); // Visit the whole document with each instance of all provided rules.

  visit(documentAST, visitWithTypeInfo(typeInfo, visitor));
  return context.getErrors();
} // @internal

export function validateSDL(documentAST, schemaToExtend) {

  const rules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : specifiedSDLRules;
  var context = new SDLValidationContext(documentAST, schemaToExtend);
  var visitors = rules.map(function (rule) {
    return rule(context);
  });
  visit(documentAST, visitInParallel(visitors));
  return context.getErrors();
}

/**
 * Utility function which asserts a SDL document is valid by throwing an error
 * if it is invalid.
 *
 * @internal
 */

export function assertValidSDL(documentAST) {
  var errors = validateSDL(documentAST);

  if (errors.length !== 0) {
    throw new Error(errors.map(function (error) {
      return error.message;
    }).join('\n\n'));
  }
}

/**
 * Utility function which asserts a SDL document is valid by throwing an error
 * if it is invalid.
 *
 * @internal
 */

export function assertValidSDLExtension(documentAST, schema) {
  var errors = validateSDL(documentAST, schema);

  if (errors.length !== 0) {
    throw new Error(errors.map(function (error) {
      return error.message;
    }).join('\n\n'));
  }
}
