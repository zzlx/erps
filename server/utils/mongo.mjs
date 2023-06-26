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

import { DBA } from './DBA.mjs';
import { assert, argvParser, } from '../utils.lib.mjs';

export const mongo = {};

const MongoClient = mongodb.MongoClient;
const client = new MongoClient('mongodb://localhost:27017', { 
  useUnifiedTopology: true
});  

const csv = '/Users/wangxuemin/test.txt';

const ARGVS = Array.prototype.slice.call(process.argv, 2);
const paramMap = argvParser(ARGVS);

function readFile (callback) {
  return new Promise((resolve, reject) => {
    const CSVFile = csv;
    const CSVFileStream = fs.createReadStream(CSVFile, 'utf8');
    const total_size = fs.lstatSync(CSVFile).size;
    let count = 0;
    let rest_str = '';

    CSVFileStream.on('readable', function () {
      let chunk;

      while (null !== (chunk = CSVFileStream.read())) {
        count += chunk.length;
        console.log(`${(count/total_size*100).toFixed(2)}%`);

        const row_array = (rest_str + chunk.toString()).split(/(?:\r)?\n/);
        rest_str = row_array.pop();

        const values = [];

        for (let row of row_array) {
          values.push(parse(row));
        }

        callback(values);
      }

      if (rest_str.length) {
        rest_str.split(/(?:\r)\n/);
      }
    });

    CSVFileStream.on('end', () => {
      console.log('Reached end of stream.');
      resolve();
    });
  });
}

function parse (row) { 
  //let column = row.split(' '); 
  let column = row.split(','); 
  let value = {
    'esn': '',
    'order_id': '',
    'in_time': '',
    'out_time': '',
    'bound_time': '',
    'user_id': '',
  };

  const itera = column[Symbol.iterator]();
  value['esn'] = itera.next().value;
  const order_id = itera.next().value;
  value['order_id'] = order_id === 'NULL' ? '' : order_id;

  const in_time = itera.next().value;
  value['in_time'] = in_time === 'NULL' ? '' : in_time;

  const out_time = itera.next().value;
  value['out_time'] = out_time === 'NULL' ? '' : out_time;

  const bound_time = itera.next().value;
  value['bound_time'] = bound_time === 'NULL' ? '' : bound_time;

  value['user_id'] = itera.next().value;

  return value;
}

const cache = new Set(); 

async function run () {
  try {
    await client.connect();
    const db = client.db('yamei');
    const collection_OBD = db.collection('OBD设备_userID');

    await readFile(function (values) {
      collection_OBD.insertMany(values);
    });

  } finally { 
    console.log('执行完毕');
    await client.close(); 
  } 
} 

//run().catch(console.error);
