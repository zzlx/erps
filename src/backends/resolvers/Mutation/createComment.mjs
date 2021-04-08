/**
 *
 *
 */
export default async (root, args, context, info) => { 
  const res = await Comments.insert(args) 
  return prepare(await Comments.find({}).toArray()) 
}
