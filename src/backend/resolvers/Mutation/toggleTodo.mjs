import mongodb from 'mongodb';
const ObjectId = mongodb.ObjectId;

/**
 *
 *
 *
 */

export default async (obj, args, ctx, info) => {
  const { id } = args;
  let prev = await ctx.mongodb.collection('todos').findOne({ _id: ObjectId(id) });
  let res = await ctx.mongodb.collection('todos').updateOne({ _id: ObjectId(id) }, {
    $set: {'completed': !prev.completed}
  });
  return await ctx.mongodb.collection('todos').findOne({ _id: ObjectId(id) });
}
