/**
 *
 */
export default async (root, args, context, info) => { 
  const db = await MongoClient.connect(MONGO_URL)
  const Posts = db.collection('posts')
  const Comments = db.collection('comments')
  const res = await Posts.insert(args) 
  return prepare(await Posts.findOne({_id: res.insertedIds[1]})) 
}
