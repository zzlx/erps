/**
 *
 *
 */

export default async (root, args, context, info) => { 
  const db = context.mongo.db('zzlx');
  const quotes = db.collection('quotes');
  const res = await quotes.insert(args) 
  return await quotes.findOne({_id: res.insertedIds[0]}) 
}
