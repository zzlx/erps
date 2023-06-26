import mongodb from 'mongodb';
const ObjectId = mongodb.ObjectId;

/**
 *
 *
 *
 */

export default async (root, args, context, info) => {
  const collection = context.mongo.db().collection('profile');
  const profile = args.profile;
  const res = await collection.updateOne(
    {_id: ObjectId(args._id)},
    {$set: {...profile}}
  );
  //console.log(result);
  //console.log(args);
  const result = await collection.findOne({_id: ObjectId(args._id)});
  return result; 
  
}
