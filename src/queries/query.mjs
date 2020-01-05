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
  
  let t_jdb = 'Output.借贷宝借据_1576452725938';
  let t_jjd = 't.今借到借据_新调取';
  let t_jjhzb = 't.借据汇总表_1578195457678';
  let t_jdbzcxx = '借贷宝.注册信息';

  const cursor = this.db.collection(t_jdb).find({
    "发标方身份证号": /undefined/
  });

  const count = await cursor.count();
  let counter = 0;
  let d = null;
  let ops = [];

  while ((d = await cursor.next()) !== null) {
    console.progressBar(counter++, count);

    const fbf = d['发标方'];
    const sjh = d['发标方手机号'];

    /*
    const res = await this.db.collection(t_jdbzcxx).findOne({
      $or: [
        {"姓名": fbf},
        {"手机号": sjh},
        {"曾用手机号": sjh}
      ]
    });

    if (null === res) continue;
    */

    ops.push({
      updateOne: {
        filter: {_id: d._id},
        update: {
          $set: {
            "发标方身份证号": sjh
          }
        }
      }
    });
  }

  await this.db.collection(t_jdb).bulkWrite(ops).then(res => {
    console.log(res);
  });


}
