/**
 *
 *
 *
 *
 */

import console from '../utils/console.mjs';
import array from '../utils/array.mjs';
import string from '../utils/strings.mjs';
import path from 'path';
import fs from 'fs';

export default async function () {
  // 执行临时任务
  //
  
  /*
  const ids = await this.db.collection('借贷宝.注册信息').find({
    '曾用手机号': {$ne: null}
  }, {projection: {
    _id: 0, 
  }}).toArray();
  const idKeyMap = array(ids).keyMap(ids, v => v['曾用手机号']);
  */

  let cn = 'Output.借贷宝借据_1576452725938';
  const cursor = this.db.collection(cn).find({ 
  });
  const count = await cursor.count();
  let doc = null;
  let counter = 0;
  const ops = [];

  while ((doc = await cursor.next()) !== null) {
    console.progressBar(++counter, count);
    ops.push({
      updateOne: {
        filter: {_id: doc['_id']},
        update: {
          $set: {
            "是否还清": doc['销帐债权'] && doc['销帐债权'] === '是' ? '否' : doc['状态'] === '全部还款' ? '是' : '否'
          }
        }
      }
    });
  }

  const res = await this.db.collection(cn).bulkWrite(ops);
  console.log(res);
}
