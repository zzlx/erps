/**
 *
 *
 */

export default async (root, args, context, info) => {
  return (await Posts.find({}).toArray()).map(prepare); 
}
