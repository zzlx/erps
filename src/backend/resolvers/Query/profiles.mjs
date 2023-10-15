/**
 *
 *
 *
 *
 *
 *
 *
 */

export default (root, args, context, info) => {  
  return context.mongodb.connect().then(client => {
    return client.db().collection('profiles').findOne();
  });
}
