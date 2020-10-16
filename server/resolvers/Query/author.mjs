/**
 *
 *
 *
 */

export default (root, args, context, info) => {
  return find(authors, { id: args.id });
}
