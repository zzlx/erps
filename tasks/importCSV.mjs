#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * 数据导入工具
 * ===========
 *
 * 支持大文件导入
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';

import mongodb from 'mongodb';
import { assert, argvParser, } from '../server/utils.mjs';

const MongoClient = mongodb.MongoClient;
const client = new MongoClient('mongodb://localhost:27017', { 
  useUnifiedTopology: true
});  

const ARGVS = Array.prototype.slice.call(process.argv, 2);
const paramMap = argvParser(ARGVS);

if (paramMap.has('input')) {
  const CSVFile = paramMap.get('input');

  const CSVFileStream = fs.createReadStream(CSVFile, 'utf8');
  const total_size = fs.lstatSync(CSVFile).size;

  CSVFileStream.on('readable', function () {
    let chunk;
    let count = 0;
    let rest_str = '';

    while (null !== (chunk = CSVFileStream.read())) {
      count += chunk.length;

      const row_array = (rest_str + chunk.toString()).split(/(?:\r)?\n/);
      rest_str = row_array.pop();

      for (let row of row_array) {
        parse(row);
      }

      console.log(`${count/total_size*100}%`);
    }

    if (rest_str.length) {
      rest_str.split(/(?:\r)\n/);
    }
  });

  CSVFileStream.on('end', () => {
    console.log('Reached end of stream.');
  });

}

function parse (row) { 
  let column = row.split(' '); 
  console.log(column);
}

/*
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

      if (updates.length > 79999) {
        //collection_dingdan.bulkWrite(updates);
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
*/
