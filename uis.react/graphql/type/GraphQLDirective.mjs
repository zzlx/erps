/**
 * *****************************************************************************
 *
 * Directives are used by the GraphQL runtime as a way of modifying execution
 * behavior. 
 * Type system creators will usually not create these directly.
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { defineToStringTag } from '../../utils/defineToStringTag.mjs';
import { defineToJSON } from '../../utils/defineToJSON.mjs';

export class GraphQLDirective {
  constructor (config) {
    this.name = config.name;
    this.description = config.description;
    this.locations = config.locations;
    this.astNode = config.astNode;

    assert(config.name, 'Directive must be named.');
    assert(Array.isArray(config.locations), 
      "@".concat(config.name, " locations must be an Array.")
    ); 

    const args = config.args || {};

    assert(
      typeof args === 'object' && !Array.isArray(args),
      `@${config.name} args must be an object with argument names as keys.`
    ); 

    this.args = Object.entries(args).map(_ref => {
      const argName = _ref[0];
      const arg = _ref[1];

      return {
        name: argName,
        description: arg.description === undefined ? null : arg.description,
        type: arg.type,
        defaultValue: arg.defaultValue,
        astNode: arg.astNode
      };
    });
  }

  toString() {
    return '@' + this.name;
  }
}

defineToStringTag(GraphQLDirective);
defineToJSON(GraphQLDirective);
