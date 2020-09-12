#!/usr/bin/env node

/**
 * *****************************************************************************
 *
 * 数据库查询
 * ==========
 *
 * *****************************************************************************
 */

import mongodb from 'mongodb';
import { assert, argvParser, } from '../server/utils.mjs';

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

    const cursor = collection_OBD.aggregate();
    const total = await cursor.count();
    let count = 0;
    let doc = null;
    let writes = [];

    while ((doc = await cursor.next()) !== null) {
      console.log(`${(count++/total)*100}%`);

      writes.push({
        updateOne: {
          filter: {_id: doc['_id']},
          update: { $set: {
            'abnormal': doc['in_time'] !== '' && doc['out_time'] !== ''
              ? (new Date(doc['out_time']) - new Date(doc['in_time'])) > 0
                ? false
                : true
              : false
          }},
        }
      });

      if (writes.length > 69999) {
        await collection_OBD.bulkWrite(writes);
        writes = [];
      }

    }

    if (writes.length) await collection_OBD.bulkWrite(writes);

  } finally { 
    console.log('执行完毕');
    await client.close(); 
  } 
} 

run().catch(console.error);
