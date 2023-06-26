/**
 *
 *
 *
 *
 *
 *
 *
 */

export default async (obj, args, ctx, info) => {
  const db = await ctx.db;
  return db.collection('todos').find().toArray();
}
