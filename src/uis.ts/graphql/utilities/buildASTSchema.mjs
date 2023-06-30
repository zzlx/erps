/**
 * This takes the ast of a schema document produced by the parse function.
 *
 * If no schema definition is provided, 
 * then it will look for types named Query and Mutation.
 *
 * Given that AST it constructs a GraphQLSchema. 
 * The resulting schema has no resolve methods, so execution use default resolvers.
 *
 * Accepts options as a second argument:
 *
 *    - commentDescriptions:
 *        Provide true to use preceding comments as the description.
 *
 */

import { keyMap } from '../../utils/keyMap.mjs';
import { keyValMap } from '../../utils/keyValMap.mjs';
import { blockStringValue } from '../../utils/blockStringValue.mjs';

import { 
  parse,
  TokenKind,
  Kind,
  isTypeDefinitionNode,
} from '../language/index.mjs';
import { 
  GraphQLScalarType, 
  GraphQLObjectType, 
  GraphQLInterfaceType, 
  GraphQLUnionType, 
  GraphQLEnumType, 
  GraphQLInputObjectType, 
  GraphQLList, 
  GraphQLNonNull, 
  GraphQLDirective, 
  GraphQLSkipDirective, 
  GraphQLIncludeDirective, 
  GraphQLDeprecatedDirective,
  introspectionTypes,
  specifiedScalarTypes,
  GraphQLSchema,
} from '../type/index.mjs';
import { getDirectiveValues } from '../execution/index.mjs';
import { assertValidSDL } from '../validation/index.mjs';
import { valueFromAST } from './valueFromAST.mjs';
import { getDescription } from './getDescription.mjs';

export function buildASTSchema(documentAST, options) {
	if (documentAST && documentAST.kind !== Kind.DOCUMENT) {
		throw new Error('Must provide valid Document AST');
	}

  if (!options || !(options.assumeValid || options.assumeValidSDL)) {
    assertValidSDL(documentAST);
  }

  let schemaDef;
  const nodeMap = Object.create(null);
  const directiveDefs = [];
  let _iteratorNormalCompletion = true;
  let _didIteratorError = false;
  let _iteratorError = undefined;

  try {
    for (
      let _iterator = documentAST.definitions[Symbol.iterator](), _step;
      !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
      _iteratorNormalCompletion = true
    ) {
      const def = _step.value;

      if (def.kind === Kind.SCHEMA_DEFINITION) {
        schemaDef = def;
      } else if (isTypeDefinitionNode(def)) {
        nodeMap[def.name.value] = def;
      } else if (def.kind === Kind.DIRECTIVE_DEFINITION) {
        directiveDefs.push(def);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) _iterator.return();
    } finally {
      if (_didIteratorError) throw _iteratorError;
    }
  }

  const operationTypes = schemaDef ? getOperationTypes(schemaDef) : {
    query: nodeMap.Query,
    mutation: nodeMap.Mutation,
    subscription: nodeMap.Subscription
  };

  const definitionBuilder = new ASTDefinitionBuilder(nodeMap, options, typeName => {
    throw new Error("Type \"".concat(typeName, "\" not found in document."));
  });

  const directives = directiveDefs.map(def => definitionBuilder.buildDirective(def));

  // If specified directives were not explicitly declared, add them.
  if (!directives.some(directive => directive.name === 'skip')) {
    directives.push(GraphQLSkipDirective);
  }

  if (!directives.some(directive => directive.name === 'include')) {
    directives.push(GraphQLIncludeDirective);
  }

  if (!directives.some(directive => directive.name === 'deprecated')) {
    directives.push(GraphQLDeprecatedDirective);
  }

  // Note: 
  // While this could make early assertions to get the correctly typed values below, 
  // that would throw immediately while type system validation with validateSchema() 
  // will produce more actionable results.
	try {
	return new GraphQLSchema({
    query: operationTypes.query 
      ? definitionBuilder.buildType(operationTypes.query) 
      : null,
    mutation: operationTypes.mutation 
      ? definitionBuilder.buildType(operationTypes.mutation) 
      : null,
    subscription: operationTypes.subscription 
      ? definitionBuilder.buildType(operationTypes.subscription) 
      : null,
    types: Object.values(nodeMap).map(node => definitionBuilder.buildType(node)),
    directives: directives,
    astNode: schemaDef,
    assumeValid: options && options.assumeValid,
    allowedLegacyNames: options && options.allowedLegacyNames
  });
	} catch (err) { console.log(err); }

  function getOperationTypes(schema) {
    const opTypes = {};
    let _iteratorNormalCompletion2 = true;
    let _didIteratorError2 = false;
    let _iteratorError2 = undefined;

    try {
      for (
        let _iterator2 = schema.operationTypes[Symbol.iterator](), _step2;
        !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); 
        _iteratorNormalCompletion2 = true
      ) {
        const operationType = _step2.value;
        opTypes[operationType.operation] = operationType.type;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) throw _iteratorError2;
      }
    }

    return opTypes;
  }
}

export class ASTDefinitionBuilder {
  constructor(typeDefinitionsMap, options, resolveType) {
    this._typeDefinitionsMap = typeDefinitionsMap;
    this._options = options;
    this._resolveType = resolveType;

    // Initialize to the GraphQL built in scalars and introspection types.
    this._cache = keyMap(
      specifiedScalarTypes.concat(introspectionTypes), 
      type => type.name
    );
  }

  buildType(node) {
    const typeName = node.name.value;

    if (!this._cache[typeName]) {
      if (node.kind === Kind.NAMED_TYPE) {
        const defNode = this._typeDefinitionsMap[typeName];
        this._cache[typeName] = defNode 
          ? this._makeSchemaDef(defNode) 
          : this._resolveType(node.name.value);
      } else {
        this._cache[typeName] = this._makeSchemaDef(node);
      }
    }

    return this._cache[typeName];
  }

  _buildWrappedType(typeNode) {
    if (typeNode.kind === Kind.LIST_TYPE) {
      return new GraphQLList(this._buildWrappedType(typeNode.type));
    }

    if (typeNode.kind === Kind.NON_NULL_TYPE) {
      return new GraphQLNonNull(this._buildWrappedType(typeNode.type));
    }

    return this.buildType(typeNode);
  }

  buildDirective(directive) {
    const locations = directive.locations.map(_ref => _ref.value);

    return new GraphQLDirective({
      name: directive.name.value,
      description: getDescription(directive, this._options),
      locations: locations,
      args: keyByNameNode(directive.arguments || [], arg => this.buildArg(arg)),
      astNode: directive
    });
  }

  buildField(field) {
    return {
      // Note: While this could make assertions to get the correctly typed
      // value, that would throw immediately while type system validation
      // with validateSchema() will produce more actionable results.
      type: this._buildWrappedType(field.type),
      description: getDescription(field, this._options),
      args: keyByNameNode(field.arguments || [], arg => this.buildArg(arg)),
      deprecationReason: getDeprecationReason(field),
      astNode: field
    };
  }

  buildArg(value) {
    // Note: While this could make assertions to get the correctly typed value,
    // that would throw immediately while type system validation
    const type = this._buildWrappedType(value.type);

    return {
      type: type,
      description: getDescription(value, this._options),
      defaultValue: valueFromAST(value.defaultValue, type),
      astNode: value
    };
  }

  buildInputField(value) {
    // Note: While this could make assertions to get the correctly typed
    // value, that would throw immediately while type system validation
    const type = this._buildWrappedType(value.type);

    return {
      type: type,
      description: getDescription(value, this._options),
      defaultValue: valueFromAST(value.defaultValue, type),
      astNode: value
    };
  };

  buildEnumValue(value) {
    return {
      description: getDescription(value, this._options),
      deprecationReason: getDeprecationReason(value),
      astNode: value
    };
  };

  _makeSchemaDef(astNode) {
    switch (astNode.kind) {
      case Kind.OBJECT_TYPE_DEFINITION:
        return this._makeTypeDef(astNode);

      case Kind.INTERFACE_TYPE_DEFINITION:
        return this._makeInterfaceDef(astNode);

      case Kind.ENUM_TYPE_DEFINITION:
        return this._makeEnumDef(astNode);

      case Kind.UNION_TYPE_DEFINITION:
        return this._makeUnionDef(astNode);

      case Kind.SCALAR_TYPE_DEFINITION:
        return this._makeScalarDef(astNode);

      case Kind.INPUT_OBJECT_TYPE_DEFINITION:
        return this._makeInputObjectDef(astNode);

      default:
        throw new Error("Type kind \"".concat(astNode.kind, "\" not supported."));
    }
  }

  _makeTypeDef(astNode) {
    var _this3 = this;

    var interfaceNodes = astNode.interfaces;
    var fieldNodes = astNode.fields;
    // Note: While this could make assertions to get the correctly typed
    // values below, that would throw immediately while type system
    // validation with validateSchema() will produce more actionable results.

    const interfaces = interfaceNodes && interfaceNodes.length > 0 
      ? () => interfaceNodes.map(ref => this.buildType(ref))
      : [];

    const fields = fieldNodes && fieldNodes.length > 0 
      ? () => keyByNameNode(fieldNodes, field => this.buildField(field))
      : Object.create(null);

    return new GraphQLObjectType({
      name: astNode.name.value,
      description: getDescription(astNode, this._options),
      interfaces: interfaces,
      fields: fields,
      astNode: astNode
    });
  };

  _makeInterfaceDef(astNode) {
    const fieldNodes = astNode.fields;
    const fields = fieldNodes && fieldNodes.length > 0 
      ? () => keyByNameNode(fieldNodes, field => this.buildField(field))
      : Object.create(null);

    return new GraphQLInterfaceType({
      name: astNode.name.value,
      description: getDescription(astNode, this._options),
      fields: fields,
      astNode: astNode
    });
  };

  _makeEnumDef(astNode) {
    var _this5 = this;

    var valueNodes = astNode.values || [];
    return new GraphQLEnumType({
      name: astNode.name.value,
      description: getDescription(astNode, this._options),
      values: keyByNameNode(valueNodes, function (value) {
        return _this5.buildEnumValue(value);
      }),
      astNode: astNode
    });
  };

  _makeUnionDef(astNode) {
    var _this6 = this;

    var typeNodes = astNode.types; // Note: While this could make assertions to get the correctly typed
    // values below, that would throw immediately while type system
    // validation with validateSchema() will produce more actionable results.

    var types = typeNodes && typeNodes.length > 0 ? function () {
      return typeNodes.map(function (ref) {
        return _this6.buildType(ref);
      });
    } : [];
    return new GraphQLUnionType({
      name: astNode.name.value,
      description: getDescription(astNode, this._options),
      types: types,
      astNode: astNode
    });
  }

  _makeScalarDef(astNode) {
    return new GraphQLScalarType({
      name: astNode.name.value,
      description: getDescription(astNode, this._options),
      astNode: astNode,
      serialize: function serialize(value) {
        return value;
      }
    });
  };

  _makeInputObjectDef(def) {
    var _this7 = this;

    var fields = def.fields;
    return new GraphQLInputObjectType({
      name: def.name.value,
      description: getDescription(def, this._options),
      fields: fields ? function () {
        return keyByNameNode(fields, function (field) {
          return _this7.buildInputField(field);
        });
      } : Object.create(null),
      astNode: def
    });
  };

}

function keyByNameNode(list, valFn) {
  return keyValMap(list, function (_ref2) {
    var name = _ref2.name;
    return name.value;
  }, valFn);
}

/**
 * Given a field or enum value node, returns the string value for the
 * deprecation reason.
 */

function getDeprecationReason(node) {
  var deprecated = getDirectiveValues(GraphQLDeprecatedDirective, node);
  return deprecated && deprecated.reason;
}
