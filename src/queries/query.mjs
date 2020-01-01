/**
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
	// 用到的数据表
  const collection = this.params.collection;
  
  const cursor = this.db.collection(collection).find({
  });

  const count = await cursor.count();
  let doc = null;
  let counter = 0;
  const ops = [];

  while ((doc = await cursor.next()) !== null) {
    console.progressBar(counter++, count);
    ops.push({
      updateOne: {
        filter: {_id: doc._id},
        update: {
          $set: {
            "是否还清": doc['已还金额'] - doc['应还金额'] >= 0 ? '是' : '否'
          }
        }
      }
    });
  }

  this.db.collection(collection).bulkWrite(ops).then(res => {
    console.log(res);
  });


}
