import { GraphQLSchema } from './GraphQLSchema.mjs';

// eslint-disable-next-line no-redeclare
export function isSchema(schema) {
  return schema instanceof GraphQLSchema;
}
