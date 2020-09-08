/**
 * *****************************************************************************
 *
 * 数据库查询
 * ==========
 *
 * *****************************************************************************
 */

import mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;
const client = new MongoClient('mongodb://localhost:27017', { 
  useUnifiedTopology: true
});  

const cache = new Set(); 

async function run () {
  try {
    await client.connect();
    const db = client.db('yamei');
    const collection_OBD = db.collection('OBD设备_userID');

    const cursor = collection_OBD.aggregate([
      { $match: { 
        "bound_time": { $ne: "" },
        "user_id": { $ne: "NULL" },
      }},
      { $group: {
        _id: "$user_id",
        count: {
          $sum: 1
        }
      }},
      { $match: { 
        "count": { $gte: 2 }, 
      }},
      { $group: {
        _id: "$_id",
        total: {
          $sum: "$count"
        }
      }},
      /*
      { $sort: {
        count: -1
      } },
      */
    ], {allowDiskUse: true});

    console.log(await cursor.toArray());

  } finally { 
    console.log('执行完毕');
    await client.close(); 
  } 
} 

run().catch(console.error);
