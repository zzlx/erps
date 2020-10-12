/**
 *
 *
 */

import mongodb from 'mongodb';
const ObjectId = mongodb.ObjectId;

const me = (obj, args, ctx, info) => {
  return ({
    _id: new ObjectID().toString(),
    name: 'test',
    email: 'email',
  }); 
}

export default me;
