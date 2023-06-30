/**
 * *****************************************************************************
 *
 * Interface Type Definition
 *
 * When a field can return one of a heterogeneous set of types, a Interface type
 * is used to describe what types are possible, what fields are in common across
 * all types, as well as a function to determine which type is actually used
 * when the field is resolved.
 *
 * Example:
 *
 *     const EntityType = new GraphQLInterfaceType({
 *       name: 'Entity',
 *       fields: {
 *         name: { type: GraphQLString }
 *       }
 *     });
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { defineToStringTag } from '../../utils/defineToStringTag.mjs';
import { defineToJSON } from '../../utils/defineToJSON.mjs';
import { inspect } from '../../utils/inspect.mjs';

export class GraphQLInterfaceType {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
    this.resolveType = config.resolveType;
    this._fields = defineFieldMap.bind(undefined, config);
    !(typeof config.name === 'string') ? assert(0, 'Must provide name.') : void 0;
    !(config.resolveType == null || typeof config.resolveType === 'function') ? assert(0, "".concat(this.name, " must provide \"resolveType\" as a function, ") + "but got: ".concat(inspect(config.resolveType), ".")) : void 0;
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
defineToStringTag(GraphQLInterfaceType);
defineToJSON(GraphQLInterfaceType);

export function defineFieldMap(config) {
  const resolveThunk = thunk => typeof thunk === 'function' ? thunk() : thunk;
  const fieldMap = resolveThunk(config.fields) || {};

  assert(
    isPlainObj(fieldMap),
    `${config.name} fields must be an object with field names as keys or a function which returns such an object.`
  );

  return mapValue(fieldMap, function (fieldConfig, fieldName) {
    !isPlainObj(fieldConfig) ? assert(0, "".concat(config.name, ".").concat(fieldName, " field config must be an object")) : void 0;
    !!fieldConfig.hasOwnProperty('isDeprecated') ? assert(0, "".concat(config.name, ".").concat(fieldName, " should provide \"deprecationReason\" ") + 'instead of "isDeprecated".') : void 0;
    !(fieldConfig.resolve == null || typeof fieldConfig.resolve === 'function') ? assert(0, "".concat(config.name, ".").concat(fieldName, " field resolver must be a function if ") + "provided, but got: ".concat(inspect(fieldConfig.resolve), ".")) : void 0;
    var argsConfig = fieldConfig.args || {};
    !isPlainObj(argsConfig) ? assert(0, "".concat(config.name, ".").concat(fieldName, " args must be an object with argument ") + 'names as keys.') : void 0;
    var args = Object.entries(argsConfig).map(function (_ref) {
      var argName = _ref[0],
          arg = _ref[1];
      return {
        name: argName,
        description: arg.description === undefined ? null : arg.description,
        type: arg.type,
        defaultValue: arg.defaultValue,
        astNode: arg.astNode
      };
    });
    return _objectSpread({}, fieldConfig, {
      isDeprecated: Boolean(fieldConfig.deprecationReason),
      name: fieldName,
      args: args
    });
  });
}
