/**
 * A validation rule which reports deprecated usages.
 *
 * Returns a list of GraphQLError instances describing each deprecated use.
 */

import { GraphQLError } from '../error/index.mjs';
import { visit, visitWithTypeInfo } from '../language/index.mjs';
import { getNamedType } from '../type/index.mjs';
import { TypeInfo } from './TypeInfo.mjs';

export function findDeprecatedUsages(schema, ast) {
  var errors = [];
  var typeInfo = new TypeInfo(schema);
  visit(ast, visitWithTypeInfo(typeInfo, {
    Field: function Field(node) {
      var fieldDef = typeInfo.getFieldDef();

      if (fieldDef && fieldDef.isDeprecated) {
        var parentType = typeInfo.getParentType();

        if (parentType) {
          var reason = fieldDef.deprecationReason;
          errors.push(new GraphQLError("The field ".concat(parentType.name, ".").concat(fieldDef.name, " is deprecated.") + (reason ? ' ' + reason : ''), [node]));
        }
      }
    },
    EnumValue: function EnumValue(node) {
      var enumVal = typeInfo.getEnumValue();

      if (enumVal && enumVal.isDeprecated) {
        var type = getNamedType(typeInfo.getInputType());

        if (type) {
          var reason = enumVal.deprecationReason;
          errors.push(new GraphQLError("The enum value ".concat(type.name, ".").concat(enumVal.name, " is deprecated.") + (reason ? ' ' + reason : ''), [node]));
        }
      }
    }
  }));
  return errors;
}
