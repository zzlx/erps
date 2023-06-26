import mongodb from 'mongodb';
const ObjectId = mongodb.ObjectId;

/**
 *
 *
 *
 */

export default async (obj, args, ctx, info) => {
  const { text, completed } = args;
  let res = await ctx.mongodb.collection('todos').insertOne({ 
    _id: new ObjectId(), 
    text, 
    completed 
  });
  return res.ops;
}
