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
  
  let cn_jdb = 'Output.借贷宝借据_1576452725938';
  let cn_jjd = 't.今借到借据_新调取';
  let cn_jjhzb = 't.借据汇总表_' + Date.now();

  let d = null;
  let counter = 0;
  let ops = [];

  const jjd_cursor = await this.db.collection(cn_jjd).find({}, {projection: {_id: 0}});
  while ((d = await jjd_cursor.next()) !== null) {
    ops.push({
      insertOne: {
        document: {
          '借条ID': d['借条ID'],
          '网贷平台': '今借到',
          '借款人': d['借款人姓名'],
          '借款人证件号码': d['借款人身份证号'],
          '借款人手机号码': d['借款人注册手机号'],
          '出借人': d['出借人姓名'],
          '出借人证件号码': d['出借人身份证号'],
          '借条金额': d['借条金额'],
          '起借日期': d['起借时间'],
          '应还日期': d['应还时间'],
          '应还金额': d['应还金额'],
          '已还金额': d['已还金额'],
          '是否逾期': d['是否逾期'],
          '逾期天数': null,
          '还清日期': d['还清日期'],
          '是否还清': d['是否还清'],
          '业务划分': d['业务归属'],
        }
      }
    });
  }

  await this.db.collection(cn_jjhzb).bulkWrite(ops).then(res => {
    console.log(res);
  });

  const jdb_cursor = await this.db.collection(cn_jdb).find({}, {projection: {_id: 0}});

  ops = [];
  d = null;
  while ((d = await jdb_cursor.next()) !== null) {
    ops.push({
      insertOne: {
        document: {
          '借条ID': d['债权ID'],
          '网贷平台': '借贷宝',
          '借款人': d['发标方'],
          '借款人证件号码': d['发标方身份证号'],
          '借款人手机号码': d['发标方手机号'],
          '出借人': d['债权人'],
          '出借人证件号码': d['债权人证件号'],
          '借条金额': d['本金'],
          '起借日期': d['借出时间'],
          '应还日期': d['到期日'],
          '应还金额': d['本金'] + d['利息'] + d['罚息金额'],
          '已还金额': d['已还金额'],
          '是否逾期': d['是否逾期'],
          '逾期天数': d['逾期天数'],
          '还清日期': d['逾期还款日期'],
          '是否还清': d['是否还清'],
          '业务划分': d['业务归属'],
        }
      }
    });
  }

  await this.db.collection(cn_jjhzb).bulkWrite(ops).then(res => {
    console.log(res);
  });

}
