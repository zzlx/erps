/**
 *
 *
 *
 *
 *
 *
 *
 */

export default async (root, args, context, info) => {  
  return context.mongodb.collection('quotes').find(args).toArray();
}
