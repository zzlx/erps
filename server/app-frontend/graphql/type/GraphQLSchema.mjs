/**
 * Schema Definition
 *
 * A Schema is created by supplying the root types of each type of operation,
 * query and mutation (optional). 
 * A schema definition is then supplied to the validator and executor.
 *
 * Example:
 *
 *     const MyAppSchema = new GraphQLSchema({
 *       query: MyAppQueryRootType,
 *       mutation: MyAppMutationRootType,
 *     })
 *
 * Note: If an array of `directives` are provided to GraphQLSchema, that will be
 * the exact list of directives represented and allowed. If `directives` is not
 * provided then a default set of the specified directives (e.g. @include and
 * @skip) will be used. If you wish to provide *additional* directives to these
 * specified directives, you must explicitly declare them. Example:
 *
 *     const MyAppSchema = new GraphQLSchema({
 *       ...
 *       directives: specifiedDirectives.concat([ myCustomDirective ]),
 *     })
 *
 */

import { defineToStringTag } from '../../utils/defineToStringTag.mjs';
import { inspect } from '../../utils/inspect.mjs';

import { isAbstractType } from './isAbstractType.mjs';
import { isObjectType } from './isObjectType.mjs';
import { isInterfaceType } from './isInterfaceType.mjs';
import { isUnionType } from './isUnionType.mjs';
import { isInputObjectType } from './isInputObjectType.mjs';
import { isWrappingType } from './isWrappingType.mjs';

import { GraphQLDirective } from './GraphQLDirective.mjs';
import { isDirective } from './isDirective.mjs';
import { specifiedDirectives } from './specifiedDirectives.mjs';

import { __Schema } from './__Schema.mjs';

export class GraphQLSchema {
  constructor (config) {
    // If this schema was built from a source known to be valid, 
    // then it may be marked with assumeValid to avoid an additional type validation.
    if (config && config.assumeValid) {
      this.__validationErrors = [];
    } else {
      this.__validationErrors = undefined; 
      // Otherwise check for common mistakes during construction to produce
      // clear and early error messages.

			if (typeof config !== 'object') {
				throw new Error('Must provide configuration object.');
			}


			if (config.types && !Array.isArray(config.types)) {
				throw new Error(
					`\"types\" must be Array if provided but got: ${inspect(config.types)}.`
				);
			}

			if (config.directives && !Array.isArray(config.directives)) {
				throw new Error(
          '"directives" must be Array if provided but got: ' + 
          "".concat(inspect(config.directives), ".")
				);
			} 

			if (config.allowedLegacyNames && !Array.isArray(config.allowedLegacyNames)) {
				throw new Error(
          '"allowedLegacyNames" must be Array if provided but got: ' + 
          "".concat(inspect(config.allowedLegacyNames), ".")
				);
			}

    }

    this.__allowedLegacyNames = config.allowedLegacyNames || [];
    this._queryType = config.query;
    this._mutationType = config.mutation;
    // Provide specified directives (e.g. @include and @skip) by default.
    this._subscriptionType = config.subscription; 

    this._directives = config.directives || specifiedDirectives;
    this.astNode = config.astNode;
    // Build type map now to detect any errors within this schema.
    this.extensionASTNodes = config.extensionASTNodes; 

    let initialTypes = [
      this.getQueryType(), 
      this.getMutationType(), 
      this.getSubscriptionType(),
      __Schema
    ];

    const types = config.types;

    if (types) {
      initialTypes = initialTypes.concat(types);
    } // Keep track of all types referenced within the schema.


    // First by deeply visiting all initial types.
    let typeMap = Object.create(null); 

    // Then by deeply visiting all directive types.
    typeMap = initialTypes.reduce(typeMapReducer, typeMap); 

    // Storing the resulting map for reference by the schema.
    typeMap = this._directives.reduce(typeMapDirectiveReducer, typeMap); 

    this._typeMap = typeMap;
    this._possibleTypeMap = Object.create(null); 
    // Keep track of all implementations by interface name.
    this._implementations = Object.create(null);

    let _iteratorNormalCompletion = true;
    let _didIteratorError = false;
    let _iteratorError = undefined;

    try {
      for (
        let _iterator = Object.values(this._typeMap)[Symbol.iterator](), _step; 
        !(_iteratorNormalCompletion = (_step = _iterator.next()).done); 
        _iteratorNormalCompletion = true
      ) {
        const type = _step.value;

        if (isObjectType(type)) {
          let _iteratorNormalCompletion2 = true;
          let _didIteratorError2 = false;
          let _iteratorError2 = undefined;

          try {
            for (
                let _iterator2 = type.getInterfaces()[Symbol.iterator](), _step2; 
                !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); 
                _iteratorNormalCompletion2 = true
              ) {
              const iface = _step2.value;

              if (isInterfaceType(iface)) {
                const impls = this._implementations[iface.name];

                if (impls) {
                  impls.push(type);
                } else {
                  this._implementations[iface.name] = [type];
                }
              }
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
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        } else if (isAbstractType(type) && !this._implementations[type.name]) {
          this._implementations[type.name] = [];
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  getQueryType() {
    return this._queryType;
  }

  getMutationType() {
    return this._mutationType;
  }

  getSubscriptionType() {
    return this._subscriptionType;
  }

  getTypeMap() {
    return this._typeMap;
  }

  getType(name) {
    return this.getTypeMap()[name];
  }

  getPossibleTypes(abstractType) {
    if (isUnionType(abstractType)) {
      return abstractType.getTypes();
    }

    return this._implementations[abstractType.name];
  }

  isPossibleType(abstractType, possibleType) {
    const possibleTypeMap = this._possibleTypeMap;

    if (!possibleTypeMap[abstractType.name]) {
      const possibleTypes = this.getPossibleTypes(abstractType);
      possibleTypeMap[abstractType.name] = possibleTypes.reduce(function (map, type) {
        return map[type.name] = true, map;
      }, Object.create(null));
    }

    return Boolean(possibleTypeMap[abstractType.name][possibleType.name]);
  }

  getDirectives() {
    return this._directives;
  }

  getDirective(name) {
    return Array.prototype.find.call(this.getDirectives(), function (directive) {
      return directive.name === name;
    });
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLSchema);

function typeMapReducer(map, type) {
  if (!type) {
    return map;
  }

  if (isWrappingType(type)) {
    return typeMapReducer(map, type.ofType);
  }

  if (map[type.name]) {
		if (!map[type.name] === type) {
			throw new Error(
        'Schema must contain unique named types but contains multiple ' + 
        "types named \"".concat(type.name, "\".")
			);
		} 

    return map;
  }

  map[type.name] = type;
  let reducedMap = map;

  if (isUnionType(type)) {
    reducedMap = type.getTypes().reduce(typeMapReducer, reducedMap);
  }

  if (isObjectType(type)) {
    reducedMap = type.getInterfaces().reduce(typeMapReducer, reducedMap);
  }

  if (isObjectType(type) || isInterfaceType(type)) {
    let _iteratorNormalCompletion3 = true;
    let _didIteratorError3 = false;
    let _iteratorError3 = undefined;

    try {
      for (
          let _iterator3 = Object.values(type.getFields())[Symbol.iterator](), _step3; 
          !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); 
          _iteratorNormalCompletion3 = true
      ) {
        const field = _step3.value;

        if (field.args) {
          const fieldArgTypes = field.args.map(function (arg) {
            return arg.type;
          });
          reducedMap = fieldArgTypes.reduce(typeMapReducer, reducedMap);
        }

        reducedMap = typeMapReducer(reducedMap, field.type);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  }

  if (isInputObjectType(type)) {
    let _iteratorNormalCompletion4 = true;
    let _didIteratorError4 = false;
    let _iteratorError4 = undefined;

    try {
      for (
        let _iterator4 = Object.values(type.getFields())[Symbol.iterator](), _step4; 
        !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); 
        _iteratorNormalCompletion4 = true
      ) {
        const _field = _step4.value;
        reducedMap = typeMapReducer(reducedMap, _field.type);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }

  return reducedMap;
}

function typeMapDirectiveReducer(map, directive) {
  // Directives are not validated until validateSchema() is called.
  if (!isDirective(directive)) {
    return map;
  }

  return directive.args.reduce((_map, arg) => typeMapReducer(_map, arg.type), map);
}
