import mongodb from 'mongodb';
const ObjectId = mongodb.ObjectId;

/**
 *
 *
 *
 */

export default async (obj, args, ctx, info) => {
  const { id } = args;

  if (typeof id === 'string') {
  }

  // 如果提供的id是一个数组
  if (Array.isArray(id)) {
  }

  let res = await ctx.mongodb.collection('todos').deleteOne({ _id: new ObjectId(id) });
  const result = res.result;
  return {
    n: result.n,
    ok: result.ok,
    id: id,
  }
}
