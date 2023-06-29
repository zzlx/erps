import { GraphQLNonNull } from './GraphQLNonNull.mjs';
import { GraphQLString } from './GraphQLString.mjs';
import { __Type } from './__Type.mjs'; 

export const TypeMetaFieldDef = {
  name: '__type',
  type: __Type,
  description: 'Request the type information of a single type.',
  args: [{
    name: 'name',
    type: new GraphQLNonNull(GraphQLString)
  }],
  resolve: function resolve(source, _ref5, context, _ref6) {
    const name = _ref5.name;
    const schema = _ref6.schema;
    return schema.getType(name);
  }
};

