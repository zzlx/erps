/**
 * *****************************************************************************
 *
 * Enum Type Definition
 *
 * Some leaf values of requests and input values are Enums. GraphQL serializes
 * Enum values as strings, however internally Enums can be represented by any
 * kind of type, often integers.
 *
 * Example:
 *
 *     const RGBType = new GraphQLEnumType({
 *       name: 'RGB',
 *       values: {
 *         RED: { value: 0 },
 *         GREEN: { value: 1 },
 *         BLUE: { value: 2 }
 *       }
 *     });
 *
 * Note: If a value is not provided in a definition, the name of the enum value
 * will be used as its internal value.
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { defineToStringTag } from '../../utils/defineToStringTag.mjs';
import { defineToJSON } from '../../utils/defineToJSON.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { keyMap } from '../../utils/keyMap.mjs';
import { isPlainObject } from '../../utils/isPlainObject.mjs';

export class GraphQLEnumType {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
    this._values = defineEnumValues(this, config.values);
    this._valueLookup = new Map(this._values.map(function (enumValue) {
      return [enumValue.value, enumValue];
    }));
    this._nameLookup = keyMap(this._values, function (value) {
      return value.name;
    });
    !(typeof config.name === 'string') ? assert(0, 'Must provide name.') : void 0;
  }

  getValues() {
    return this._values;
  }

  getValue(name) {
    return this._nameLookup[name];
  };

  serialize(value) {
    const enumValue = this._valueLookup.get(value);
    if (enumValue) return enumValue.name;
  }

  parseValue(value) {
    if (typeof value === 'string') {
      const enumValue = this.getValue(value);
      if (enumValue) return enumValue.value;
    }
  };

  parseLiteral(valueNode, _variables) {
    // Note: variables will be resolved to a value before calling this function.
    if (valueNode.kind === Kind.ENUM) {
      const enumValue = this.getValue(valueNode.value);
      if (enumValue) return enumValue.value;
    }
  }

  toString() {
    return this.name;
  }

}

defineToStringTag(GraphQLEnumType);
defineToJSON(GraphQLEnumType);

function defineEnumValues(type, valueMap) {
  !isPlainObject(valueMap) ? assert(0, "".concat(type.name, " values must be an object with value names as keys.")) : void 0;
  return Object.entries(valueMap).map(function (_ref2) {
    var valueName = _ref2[0], value = _ref2[1];
    !isPlainObject(value) ? assert(0, "".concat(type.name, ".").concat(valueName, " must refer to an object with a \"value\" key ") + "representing an internal value but got: ".concat(inspect(value), ".")) : void 0;
    !!value.hasOwnProperty('isDeprecated') ? assert(0, "".concat(type.name, ".").concat(valueName, " should provide \"deprecationReason\" instead ") + 'of "isDeprecated".') : void 0;
    return {
      name: valueName,
      description: value.description,
      isDeprecated: Boolean(value.deprecationReason),
      deprecationReason: value.deprecationReason,
      astNode: value.astNode,
      value: value.hasOwnProperty('value') ? value.value : valueName
    };
  });
}
