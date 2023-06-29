/**
 * This method looks up the field on the given type definition.
 * It has two special casing for the introspection fields:
 * 1. __typename is special because it can always be queried as a field, 
 * even in situations where no other fields are allowed, like on a Union.
 * 2. __schema could get automatically added to the query type, 
 * but that would require mutating type definitions, which would cause issues.
 */

import { 
  SchemaMetaFieldDef, TypeMetaFieldDef, TypeNameMetaFieldDef, 
} from '../type/index.mjs';

export function getFieldDef(schema, parentType, fieldName) {
  if (
    fieldName === SchemaMetaFieldDef.name && schema.getQueryType() === parentType
  ) {
    return SchemaMetaFieldDef;
  } else if (
    fieldName === TypeMetaFieldDef.name && schema.getQueryType() === parentType
  ) {
    return TypeMetaFieldDef;
  } else if (fieldName === TypeNameMetaFieldDef.name) {
    return TypeNameMetaFieldDef;
  }

  return parentType.getFields()[fieldName];
}
