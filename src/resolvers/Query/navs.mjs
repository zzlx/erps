/**
 *
 */

export default (root, args, ctx, info) => {  
  return ctx.mongodb.connect().then(client => {
    return client.db().collection('navs').find().toArray();
  });
}
