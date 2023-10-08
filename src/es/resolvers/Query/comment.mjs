/**
 *
 *
 */

import mongodb from 'mongodb';
const ObjectId = mongodb.ObjectId;

export default async function comment(root, args, context, info) {
  return prepare(await Comments.findOne(ObjectId(args._id)));
}

