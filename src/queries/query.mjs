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
  // 防止误操作
  //return;
  
  /*
  const ids = await this.db.collection('INFO.嫌疑人_名单_20191218').find({
  }, {projection: {
    _id: 0, 
  }}).toArray();
  const idKeyMap = array(ids).keyMap(ids, v => v['身份证号']);
  */

  let cn_jdb = 'Output.借贷宝借据_1576452725938';
  let cn_jjd = 't.今借到借据_新调取';

  const name = '吴从越';

  const cursor = this.db.collection(cn_jjd).find({ 
    "出借人姓名": name,
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
            "业务归属": doc['起借时间'] >= new Date('2010-01-01') ? name : doc['业务归属'],
          }
        }
      }
    });
  }

  const res = ops.length > 0 ? await this.db.collection(cn_jjd).bulkWrite(ops) : 0;
  console.log(res);

  const cursor_jdb = this.db.collection(cn_jdb).find({ 
    "债权人": name
  });

  const count_jdb = await cursor_jdb.count();
  doc = null;
  counter = 0;
  const ops_jdb = [];

  while ((doc = await cursor_jdb.next()) !== null) {
    console.progressBar(++counter, count_jdb);

    ops_jdb.push({
      updateOne: {
        filter: {_id: doc['_id']},
        update: {
          $set: {
            "业务归属": doc['借出时间'] <= new Date('2010-01-01') ? name : doc["业务归属"],
          }
        }
      }
    });
  }

  const res_jdb = ops_jdb.length > 0 ? await this.db.collection(cn_jdb).bulkWrite(ops_jdb) : 0;
  console.log(res_jdb);
}
