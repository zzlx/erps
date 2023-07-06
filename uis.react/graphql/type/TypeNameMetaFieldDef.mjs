import { GraphQLNonNull } from './GraphQLNonNull.mjs';
import { GraphQLString } from './GraphQLString.mjs';

export const TypeNameMetaFieldDef = {
  name: '__typename',
  type: new GraphQLNonNull(GraphQLString),
  description: 'The name of the current Object type at runtime.',
  args: [],
  resolve: function resolve(source, args, context, ref) {
    const parentType = ref.parentType;
    return parentType.name;
  }
};
