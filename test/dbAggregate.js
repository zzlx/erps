/**
 * *****************************************************************************
 *
 * 数据库查询
 * ==========
 *
 * *****************************************************************************
 */

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const client = new MongoClient('mongodb://localhost:27017', { 
  useUnifiedTopology: true
});  

const cache = new Set(); 

async function run () {
  try {
    await client.connect();
    const db = client.db('yamei');
    const collection_ESN = db.collection('ESN');
    const collection_chuku = db.collection('出库记录');
    const collection_dingdan = db.collection('订单-转换自原始数据');

    const cursor = collection_dingdan.aggregate([
      { $match: { 
        "商品价格": { $gte: 300 }, 
      }},
      { $group: {
        _id: "$购买账号",
        count: {
          $sum: 1
        }
      }},
      { $match: { 
        "count": { $gte: 3 }, 
      }},
      { $sort: {
        count: -1
      } },
    ], {allowDiskUse: true});

    console.log(await cursor.toArray());

  } finally { 
    console.log('执行完毕');
    await client.close(); 
  } 
} 

run().catch(console.error);
