/**
 * *****************************************************************************
 *
 * 
 *
 * *****************************************************************************
 */

import { isScalarType } from './isScalarType.mjs';
import { isInterfaceType } from './isInterfaceType.mjs';
import { isUnionType } from './isUnionType.mjs';
import { isInputObjectType } from './isInputObjectType.mjs';
import { isAbstractType } from './isAbstractType.mjs';
import { isNamedType } from './isNamedType.mjs';

import { __TypeKind } from './__TypeKind.mjs';
import { __Field } from './__Field.mjs';
import { GraphQLObjectType } from './GraphQLObjectType.mjs';
import { GraphQLNonNull } from './GraphQLNonNull.mjs';
import { GraphQLString } from './GraphQLString.mjs';
import { GraphQLBoolean } from './GraphQLBoolean.mjs';

export const __Type = new GraphQLObjectType({
  name: '__Type',
  description: 
    'The fundamental unit of any GraphQL Schema is the type. There are ' + 
    'many kinds of types in GraphQL as represented by the `__TypeKind` enum.' +
    '\n\nDepending on the kind of a type, certain fields describe ' +
    'information about that type. Scalar types provide no information ' + 
    'beyond a name and description, while Enum types provide their values. ' +
    'Object and Interface types provide the fields they describe. Abstract ' +
    'types, Union and Interface, provide the Object types possible ' + 
    'at runtime. List and NonNull types compose other types.',
  fields: function fields() {
    return {
      kind: {
        type: new GraphQLNonNull(__TypeKind),
        resolve: function resolve(type) {
          if (isScalarType(type)) {
            return TypeKind.SCALAR;
          } else if (isObjectType(type)) {
            return TypeKind.OBJECT;
          } else if (isInterfaceType(type)) {
            return TypeKind.INTERFACE;
          } else if (isUnionType(type)) {
            return TypeKind.UNION;
          } else if (isEnumType(type)) {
            return TypeKind.ENUM;
          } else if (isInputObjectType(type)) {
            return TypeKind.INPUT_OBJECT;
          } else if (isListType(type)) {
            return TypeKind.LIST;
          } else if (isNonNullType(type)) {
            return TypeKind.NON_NULL;
          }

          throw new Error('Unknown kind of type: ' + type);
        }
      },
      name: {
        type: GraphQLString,
        resolve: function resolve(obj) {
          return obj.name;
        }
      },
      description: {
        type: GraphQLString,
        resolve: function resolve(obj) {
          return obj.description;
        }
      },
      fields: {
        type: new GraphQLList(new GraphQLNonNull(__Field)),
        args: {
          includeDeprecated: {
            type: GraphQLBoolean,
            defaultValue: false
          }
        },
        resolve: function resolve(type, _ref) {
          var includeDeprecated = _ref.includeDeprecated;

          if (isObjectType(type) || isInterfaceType(type)) {
            var fields = Object.values(type.getFields());

            if (!includeDeprecated) {
              fields = fields.filter(function (field) {
                return !field.deprecationReason;
              });
            }

            return fields;
          }

          return null;
        }
      },
      interfaces: {
        type: new GraphQLList(new GraphQLNonNull(__Type)),
        resolve: function resolve(type) {
          if (isObjectType(type)) {
            return type.getInterfaces();
          }
        }
      },
      possibleTypes: {
        type: new GraphQLList(new GraphQLNonNull(__Type)),
        resolve: function resolve(type, args, context, _ref2) {
          var schema = _ref2.schema;

          if (isAbstractType(type)) {
            return schema.getPossibleTypes(type);
          }
        }
      },
      enumValues: {
        type: new GraphQLList(new GraphQLNonNull(__EnumValue)),
        args: {
          includeDeprecated: {
            type: GraphQLBoolean,
            defaultValue: false
          }
        },
        resolve: function resolve(type, _ref3) {
          var includeDeprecated = _ref3.includeDeprecated;

          if (isEnumType(type)) {
            var values = type.getValues();

            if (!includeDeprecated) {
              values = values.filter(function (value) {
                return !value.deprecationReason;
              });
            }

            return values;
          }
        }
      },
      inputFields: {
        type: new GraphQLList(new GraphQLNonNull(__InputValue)),
        resolve: function resolve(type) {
          if (isInputObjectType(type)) {
            return Object.values(type.getFields());
          }
        }
      },
      ofType: {
        type: __Type,
        resolve: function resolve(obj) {
          return obj.ofType;
        }
      }
    };
  }
});


