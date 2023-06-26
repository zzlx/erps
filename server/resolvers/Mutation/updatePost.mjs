/**
 *
 *
 *
 */

export default (_, args, context, info) => {
  const post = find(posts, { id: args.postId });
  if (!post) { throw new Error(`Couldn't find post with id ${postId}`) }
  post.votes += 1;
  return post;
}
