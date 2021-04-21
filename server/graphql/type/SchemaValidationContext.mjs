/**
 * SchemaValidation 
 */

import { GraphQLError } from '../error/index.mjs';

export class SchemaValidationContext {
  constructor(schema) {
    this._errors = [];
    this.schema = schema;
  }

  reportError(message, nodes) {
    const _nodes = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    this.addError(new GraphQLError(message, _nodes));
  }

  addError(error) {
    this._errors.push(error);
  }

  getErrors() {
    return this._errors;
  }
}

