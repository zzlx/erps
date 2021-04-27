/**
 * *****************************************************************************
 * 
 * 生产唯一ID序列值
 *
 * @TODO: 研究ObjectID算法
 * *****************************************************************************
 */

import mongodb from 'mongodb';
const ObjectID = mongodb.ObjectId;

export function getID () {
  return new ObjectID(); 
}
