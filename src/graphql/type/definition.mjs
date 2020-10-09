/**
 * 类型定义
 */

import _objectSpread from '../../utils/objectSpread.mjs';
import _defineProperty from '../../utils/defineProperty.mjs';
import defineToJSON from '../../utils/defineToJSON.mjs';
import defineToStringTag from '../../utils/defineToStringTag.mjs';
import instanceOf from '../../utils/instanceOf.mjs';
import inspect from '../../utils/inspect.mjs';
import invariant from '../../utils/invariant.mjs';
import keyMap from '../../utils/keyMap.mjs';
import mapValue from '../../utils/mapValue.mjs';

import { Kind } from '../language/kinds.mjs';
import { valueFromASTUntyped } from '../utilities/valueFromASTUntyped.mjs';

export function isType(type) {
  return isScalarType(type) || 
    isObjectType(type) || 
    isInterfaceType(type) || 
    isUnionType(type) || 
    isEnumType(type) || 
    isInputObjectType(type) || 
    isListType(type) || 
    isNonNullType(type);
}

export function assertType(type) {
  invariant( 
    isType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL type.")
  );

  return type;
}

/**
 * There are predicates for each kind of GraphQL type.
 */

// eslint-disable-next-line no-redeclare
export function isScalarType(type) {
  return instanceOf(type, GraphQLScalarType);
}

export function assertScalarType(type) {
  invariant(
    isScalarType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Scalar type.")
  ); 
  return type;
}

// eslint-disable-next-line no-redeclare
export function isObjectType(type) {
  return instanceOf(type, GraphQLObjectType);
}

export function assertObjectType(type) {
  invariant(
    isObjectType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Object type.")
  );
  return type;
}

// eslint-disable-next-line no-redeclare
export function isInterfaceType(type) {
  return instanceOf(type, GraphQLInterfaceType);
}

export function assertInterfaceType(type) {
  invariant(
    isInterfaceType(type),
    "Expected ".concat(inspect(type), " to be a GraphQL Interface type.")
  ); 
  return type;
}

// eslint-disable-next-line no-redeclare
export function isUnionType(type) {
  return instanceOf(type, GraphQLUnionType);
}

export function assertUnionType(type) {
  invariant(
    isUnionType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Union type.")
  ); 
  return type;
}

// eslint-disable-next-line no-redeclare
export function isEnumType(type) {
  return instanceOf(type, GraphQLEnumType);
}

export function assertEnumType(type) {
  invariant(
    isEnumType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Enum type.")
  );
  return type;
}

// eslint-disable-next-line no-redeclare
export function isInputObjectType(type) {
  return instanceOf(type, GraphQLInputObjectType);
}

export function assertInputObjectType(type) {
  invariant(
    isInputObjectType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Input Object type.")
  );
  return type;
}
// eslint-disable-next-line no-redeclare
export function isListType(type) {
  return instanceOf(type, GraphQLList);
}

export function assertListType(type) {
  invariant(
    isListType(type),
    "Expected ".concat(inspect(type), " to be a GraphQL List type.")
  );
  return type;
}

// eslint-disable-next-line no-redeclare
export function isNonNullType(type) {
  return instanceOf(type, GraphQLNonNull);
}

export function assertNonNullType(type) {
  invariant(
    isNonNullType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Non-Null type.")
  );
  return type;
}

/**
 * These types may be used as input types for arguments and directives.
 */

export function isInputType(type) {
  return isScalarType(type) || 
    isEnumType(type) || 
    isInputObjectType(type) || 
    isWrappingType(type) && isInputType(type.ofType);
}

export function assertInputType(type) {
  invariant(
    isInputType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL input type.")
  );
  return type;
}

/**
 * These types may be used as output types as the result of fields.
 */

export function isOutputType(type) {
  return isScalarType(type) || 
    isObjectType(type) || 
    isInterfaceType(type) || 
    isUnionType(type) || 
    isEnumType(type) || 
    isWrappingType(type) && isOutputType(type.ofType);
}

export function assertOutputType(type) {
  invariant(
    isOutputType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL output type.")
  );
  return type;
}
/**
 * These types may describe types which may be leaf values.
 */

export function isLeafType(type) {
  return isScalarType(type) || isEnumType(type);
}

export function assertLeafType(type) {
  invariant(
    isLeafType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL leaf type.")
  );
  return type;
}

/**
 * These types may describe the parent context of a selection set.
 */

export function isCompositeType(type) {
  return isObjectType(type) || isInterfaceType(type) || isUnionType(type);
}

export function assertCompositeType(type) {
  invariant( 
    isCompositeType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL composite type.")
  );
  return type;
}

/**
 * These types may describe the parent context of a selection set.
 */

export function isAbstractType(type) {
  return isInterfaceType(type) || isUnionType(type);
}

export function assertAbstractType(type) {
  invariant(
    isAbstractType(type),
    "Expected ".concat(inspect(type), " to be a GraphQL abstract type.")
  );

  return type;
}

/**
 * List Type Wrapper
 *
 * A list is a wrapping type which points to another type.
 * Lists are often created within the context of defining the fields of
 * an object type.
 *
 * Example:
 *
 *     const PersonType = new GraphQLObjectType({
 *       name: 'Person',
 *       fields: () => ({
 *         parents: { type: GraphQLList(PersonType) },
 *         children: { type: GraphQLList(PersonType) },
 *       })
 *     })
 *
 */

// eslint-disable-next-line no-redeclare
export class GraphQLList {
  constructor(ofType) {
    if (this instanceof GraphQLList) {
      this.ofType = assertType(ofType);
    } else {
      return new GraphQLList(ofType);
    }
  }

  toString() {
    return '[' + String(this.ofType) + ']';
  }
}

defineToJSON(GraphQLList);

/**
 * Non-Null Type Wrapper
 *
 * A non-null is a wrapping type which points to another type.
 * Non-null types enforce that their values are never null and can ensure
 * an error is raised if this ever occurs during a request. It is useful for
 * fields which you can make a strong guarantee on non-nullability, for example
 * usually the id field of a database row will never be null.
 *
 * Example:
 *
 *     const RowType = new GraphQLObjectType({
 *       name: 'Row',
 *       fields: () => ({
 *         id: { type: GraphQLNonNull(GraphQLString) },
 *       })
 *     })
 *
 * Note: the enforcement of non-nullability occurs within the executor.
 */

// eslint-disable-next-line no-redeclare
export class GraphQLNonNull {
  constructor(ofType) {
    if (this instanceof GraphQLNonNull) {
      this.ofType = assertNullableType(ofType);
    } else {
      return new GraphQLNonNull(ofType);
    }
  }

  toString() {
    return String(this.ofType) + '!';
  }
} 

defineToJSON(GraphQLNonNull);

/**
 * These types wrap and modify other types
 */

export function isWrappingType(type) {
  return isListType(type) || isNonNullType(type);
}

export function assertWrappingType(type) {
  invariant(
    isWrappingType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL wrapping type.")
  );
  return type;
}

/**
 * These types can all accept null as a value.
 */

export function isNullableType(type) {
  return isType(type) && !isNonNullType(type);
}

export function assertNullableType(type) {
  invariant(
    isNullableType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL nullable type.")
  );
  return type;
}
/* eslint-disable no-redeclare */

export function getNullableType(type) {
  if (type) {
    return isNonNullType(type) ? type.ofType : type;
  }
}

/**
 * These named types do not include modifiers like List or NonNull.
 */

export function isNamedType(type) {
  return isScalarType(type) || 
    isObjectType(type) || 
    isInterfaceType(type) || 
    isUnionType(type) || 
    isEnumType(type) || 
    isInputObjectType(type);
}

export function assertNamedType(type) {
  invariant(
    isNamedType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL named type.")
  );
  return type;
}

export function getNamedType(type) {
  if (type) {
    let unwrappedType = type;

    while (isWrappingType(unwrappedType)) {
      unwrappedType = unwrappedType.ofType;
    }

    return unwrappedType;
  }
}

/**
 * Used while defining GraphQL types to allow for circular references in
 * otherwise immutable type definitions.
 */

function resolveThunk(thunk) {
  // $FlowFixMe(>=0.90.0)
  return typeof thunk === 'function' ? thunk() : thunk;
}

/**
 * Scalar Type Definition
 *
 * The leaf values of any request and input values to arguments are
 * Scalars (or Enums) and are defined with a name and a series of functions
 * used to parse input from ast or variables and to ensure validity.
 *
 * If a type's serialize function does not return a value (i.e. it returns
 * `undefined`) then an error will be raised and a `null` value will be returned
 * in the response. If the serialize function returns `null`, then no error will
 * be included in the response.
 *
 * Example:
 *
 *     const OddType = new GraphQLScalarType({
 *       name: 'Odd',
 *       serialize(value) {
 *         if (value % 2 === 1) {
 *           return value;
 *         }
 *       }
 *     });
 *
 */


/*#__PURE__*/
export class GraphQLScalarType {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.serialize = config.serialize;

    this.parseValue = config.parseValue || function (value) { return value; };

    this.parseLiteral = config.parseLiteral || valueFromASTUntyped;
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
    invariant(typeof config.name === 'string', 'Must provide name.');
    invariant(
      (typeof config.serialize === 'function'), 
      "".concat(this.name, " must provide \"serialize\" function. If this custom Scalar ") + 
      'is also used as an input type, ensure "parseValue" and "parseLiteral" ' + 
      'functions are also provided.'
    );

    if (config.parseValue || config.parseLiteral) {
      invariant(
        typeof config.parseValue === 'function' && 
        typeof config.parseLiteral === 'function', 
        `${this.name} must provide both parseValue and parseLiteral functions.`) 
    }
  }

  toString() {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLScalarType);
defineToJSON(GraphQLScalarType);

/**
 * Object Type Definition
 *
 * Almost all of the GraphQL types you define will be object types. Object types
 * have a name, but most importantly describe their fields.
 *
 * Example:
 *
 *     const AddressType = new GraphQLObjectType({
 *       name: 'Address',
 *       fields: {
 *         street: { type: GraphQLString },
 *         number: { type: GraphQLInt },
 *         formatted: {
 *           type: GraphQLString,
 *           resolve(obj) {
 *             return obj.number + ' ' + obj.street
 *           }
 *         }
 *       }
 *     });
 *
 * When two types need to refer to each other, or a type needs to refer to
 * itself in a field, you can use a function expression (aka a closure or a
 * thunk) to supply the fields lazily.
 *
 * Example:
 *
 *     const PersonType = new GraphQLObjectType({
 *       name: 'Person',
 *       fields: () => ({
 *         name: { type: GraphQLString },
 *         bestFriend: { type: PersonType },
 *       })
 *     });
 *
 */

export class GraphQLObjectType {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
    this.isTypeOf = config.isTypeOf;
    this._fields = defineFieldMap.bind(undefined, config);
    this._interfaces = defineInterfaces.bind(undefined, config);
    !(typeof config.name === 'string') ? invariant(0, 'Must provide name.') : void 0;
    !(config.isTypeOf == null || typeof config.isTypeOf === 'function') 
      ? invariant(0, "".concat(this.name, " must provide \"isTypeOf\" as a function, ") + 
        "but got: ".concat(inspect(config.isTypeOf), ".")) 
      : void 0;
  }

  getFields() {
    if (typeof this._fields === 'function') this._fields = this._fields();
    return this._fields;
  }

  getInterfaces() {
    if (typeof this._interfaces === 'function') {
      this._interfaces = this._interfaces();
    }

    return this._interfaces;
  }

  toString() {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLObjectType);
defineToJSON(GraphQLObjectType);

function defineInterfaces(config) {
  const interfaces = resolveThunk(config.interfaces) || [];
  invariant(
    Array.isArray(interfaces),
    `${config.name} interfaces must be an Array or a function which returns an Array`
  );
  return interfaces;
}

function defineFieldMap(config) {
  var fieldMap = resolveThunk(config.fields) || {};

  invariant(
    isPlainObj(fieldMap),
    `${config.name} fields must be an object with field names as keys or a function which returns such an object.`
  );

  return mapValue(fieldMap, function (fieldConfig, fieldName) {
    !isPlainObj(fieldConfig) ? invariant(0, "".concat(config.name, ".").concat(fieldName, " field config must be an object")) : void 0;
    !!fieldConfig.hasOwnProperty('isDeprecated') ? invariant(0, "".concat(config.name, ".").concat(fieldName, " should provide \"deprecationReason\" ") + 'instead of "isDeprecated".') : void 0;
    !(fieldConfig.resolve == null || typeof fieldConfig.resolve === 'function') ? invariant(0, "".concat(config.name, ".").concat(fieldName, " field resolver must be a function if ") + "provided, but got: ".concat(inspect(fieldConfig.resolve), ".")) : void 0;
    var argsConfig = fieldConfig.args || {};
    !isPlainObj(argsConfig) ? invariant(0, "".concat(config.name, ".").concat(fieldName, " args must be an object with argument ") + 'names as keys.') : void 0;
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

function isPlainObj(obj) {
  return obj && typeof(obj) === 'object' && !Array.isArray(obj);
}

export function isRequiredArgument(arg) {
  return isNonNullType(arg.type) && arg.defaultValue === undefined;
}

/**
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
 */
export class GraphQLInterfaceType {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
    this.resolveType = config.resolveType;
    this._fields = defineFieldMap.bind(undefined, config);
    !(typeof config.name === 'string') ? invariant(0, 'Must provide name.') : void 0;
    !(config.resolveType == null || typeof config.resolveType === 'function') ? invariant(0, "".concat(this.name, " must provide \"resolveType\" as a function, ") + "but got: ".concat(inspect(config.resolveType), ".")) : void 0;
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

/**
 * Union Type Definition
 *
 * When a field can return one of a heterogeneous set of types, a Union type
 * is used to describe what types are possible as well as providing a function
 * to determine which type is actually used when the field is resolved.
 *
 * Example:
 *
 *     const PetType = new GraphQLUnionType({
 *       name: 'Pet',
 *       types: [ DogType, CatType ],
 *       resolveType(value) {
 *         if (value instanceof Dog) {
 *           return DogType;
 *         }
 *         if (value instanceof Cat) {
 *           return CatType;
 *         }
 *       }
 *     });
 *
 */
export class GraphQLUnionType {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
    this.resolveType = config.resolveType;
    this._types = defineTypes.bind(undefined, config);
    !(typeof config.name === 'string') ? invariant(0, 'Must provide name.') : void 0;
    !(config.resolveType == null || typeof config.resolveType === 'function') ? invariant(0, "".concat(this.name, " must provide \"resolveType\" as a function, ") + "but got: ".concat(inspect(config.resolveType), ".")) : void 0;
  }


  getTypes() {
    if (typeof this._types === 'function') {
      this._types = this._types();
    }

    return this._types;
  }

  toString() {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLUnionType);
defineToJSON(GraphQLUnionType);

function defineTypes(config) {
  var types = resolveThunk(config.types) || [];
  !Array.isArray(types) 
    ? invariant(0, 'Must provide Array of types or a function which returns ' + 
      "such an array for Union ".concat(config.name, ".")) 
    : void 0;
  return types;
}

/**
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
 */
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
    !(typeof config.name === 'string') ? invariant(0, 'Must provide name.') : void 0;
  }

  getValues() {
    return this._values;
  }

  getValue(name) {
    return this._nameLookup[name];
  };

  serialize(value) {
    var enumValue = this._valueLookup.get(value);

    if (enumValue) {
      return enumValue.name;
    }
  }

  parseValue(value) {
    if (typeof value === 'string') {
      var enumValue = this.getValue(value);

      if (enumValue) {
        return enumValue.value;
      }
    }
  };

  parseLiteral(valueNode, _variables) {
    // Note: variables will be resolved to a value before calling this function.
    if (valueNode.kind === Kind.ENUM) {
      var enumValue = this.getValue(valueNode.value);

      if (enumValue) {
        return enumValue.value;
      }
    }
  }

  toString() {
    return this.name;
  }

}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLEnumType);
defineToJSON(GraphQLEnumType);

function defineEnumValues(type, valueMap) {
  !isPlainObj(valueMap) ? invariant(0, "".concat(type.name, " values must be an object with value names as keys.")) : void 0;
  return Object.entries(valueMap).map(function (_ref2) {
    var valueName = _ref2[0],
        value = _ref2[1];
    !isPlainObj(value) ? invariant(0, "".concat(type.name, ".").concat(valueName, " must refer to an object with a \"value\" key ") + "representing an internal value but got: ".concat(inspect(value), ".")) : void 0;
    !!value.hasOwnProperty('isDeprecated') ? invariant(0, "".concat(type.name, ".").concat(valueName, " should provide \"deprecationReason\" instead ") + 'of "isDeprecated".') : void 0;
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

/**
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
 */
export class GraphQLInputObjectType {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
    this._fields = defineInputFieldMap.bind(undefined, config);
    invariant(typeof config.name === 'string', 'Must provide name.');
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
  invariant(
    isPlainObj(fieldMap),
    "".concat(config.name, " fields must be an object with field names as keys or a ") + 
    'function which returns such an object.'
  );

  return mapValue(fieldMap, (fieldConfig, fieldName) => {
    invariant(
      !fieldConfig.hasOwnProperty('resolve'),
      "".concat(config.name, ".").concat(fieldName, " field has a resolve property, but ") +
      'Input Types cannot define resolvers.'
    );

    return _objectSpread({}, fieldConfig, { name: fieldName });
  });
}

export function isRequiredInputField(field) {
  return isNonNullType(field.type) && field.defaultValue === undefined;
}
