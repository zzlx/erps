/**
 *
 *
 */

export default async (obj, args, ctx, info) => {
  return await ctx.mongodb.collection('links').find().toArray();
}
