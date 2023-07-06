/**
 * *****************************************************************************
 *
 * Input Object Type Definition
 *
 * An input object defines a structured collection of fields which may be
 * supplied to a field argument.
 *
 * Using `NonNull` will ensure that a value must be provided by the query
 *
 * Example:
 *
 *     const GeoPoint = new GraphQLInputObjectType({
 *       name: 'GeoPoint',
 *       fields: {
 *         lat: { type: GraphQLNonNull(GraphQLFloat) },
 *         lon: { type: GraphQLNonNull(GraphQLFloat) },
 *         alt: { type: GraphQLFloat, defaultValue: 0 },
 *       }
 *     });
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { defineToStringTag } from '../../utils/defineToStringTag.mjs';
import { defineToJSON } from '../../utils/defineToJSON.mjs';

export class GraphQLInputObjectType {
  constructor(config) {
    assert(typeof config.name === 'string', 'Must provide name.');
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
    this._fields = defineInputFieldMap.bind(undefined, config);
  }

  getFields() {
    if (typeof this._fields === 'function') {
      this._fields = this._fields();
    }

    return this._fields;
  }

  toString() {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLInputObjectType);
defineToJSON(GraphQLInputObjectType);

function defineInputFieldMap(config) {
  const fieldMap = resolveThunk(config.fields) || {};
  assert(
    isPlainObj(fieldMap),
    "".concat(config.name, " fields must be an object with field names as keys or a ") + 
    'function which returns such an object.'
  );

  return mapValue(fieldMap, (fieldConfig, fieldName) => {
    assert(
      !fieldConfig.hasOwnProperty('resolve'),
      "".concat(config.name, ".").concat(fieldName, " field has a resolve property, but ") +
      'Input Types cannot define resolvers.'
    );

    return _objectSpread({}, fieldConfig, { name: fieldName });
  });
}
