export default async (root, args, context, info) => {
  return prepare(await Posts.findOne(ObjectId(args._id)));
}
