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

    const cursor = collection_dingdan.find();
    const count = await cursor.count();
    console.log(`Total number: ${count}`);

    let updates = [];
    let i = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      i++

      updates.push({
        updateOne: {
          "filter" : { _id: doc['_id'] },
          "update": { $set: {
            '购买账号': String(doc['购买账号']).trim(),
          }},
          "upsert": true,
        }
      });

      if (updates.length > 80000) {
        console.log(i);
        collection_dingdan.bulkWrite(updates);
        updates = [];
      }

    }

    if (updates.length) { 
      await collection_dingdan.bulkWrite(updates);
    }

  } finally { 
    console.log('执行完毕');
    await client.close(); 
  } 
} 

run().catch(console.error);
