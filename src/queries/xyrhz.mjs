/**
 *
 *
 *
 *
 */

import console from '../utils/console.mjs';
import array from '../utils/array.mjs';
import date from '../utils/date.mjs';
import string from '../utils/strings.mjs';
import path from 'path';
import fs from 'fs';

export default async function () {
  //
  let t_xyr_md = 'INFO.嫌疑人_名单_20191218';
  let t_jjdjj_xdq = 't.今借到借据_新调取';
  let t_jdbjj = 'Output.借贷宝借据_1576452725938';

  const cursor = this.db.collection(t_xyr_md).find({}, {
    projection: { _id: 0},
    sort: { "所属公司": 1 },
  });

  let d = null;
  let number = 0;

  let md = ''
  md = `
| 序号 | 公司 | 姓名 | 入职日期 | 离职日期| 借贷宝借款人数 | 借贷宝交易笔数 | 借贷宝既遂借条金额 | 借贷宝未遂借条金额 | 今借到借款人数 | 今借到交易笔数 | 今借到既遂借条金额 | 今借到未遂借条金额 | 借贷宝最早时间 | 借贷宝最晚时间 | 今借到最早时间 | 今借到最晚时间 |
| :--: | :--: | :--: | :----:   | :----:  | :----:         | :----:       | :----:             | :----:             | :----:         | :------:     | :------:       | :---:  | :--: | :--: | :---: | :---: |
`;

  let counter = 0;

  while ((d = await cursor.next()) !== null) {
    console.progressBar(counter++, 158);

    const xyr_id = d['身份证号'];

    // 统计今借到
    const jjd_count = await this.db.collection(t_jjdjj_xdq).aggregate([
      { $match: { '出借人身份证号': xyr_id }},
      { $group: { _id: null, count: {$sum: 1} }},
    ]).next();

    // 最早时间
    const jjd_count_time_zz = await this.db.collection(t_jjdjj_xdq).findOne( 
      { '出借人身份证号': xyr_id },
      { sort: { '借条生成时间': 1}}, 
    );

    // 最晚时间
    const jjd_count_time_zw = await this.db.collection(t_jjdjj_xdq).findOne( 
      { '出借人身份证号': xyr_id },
      { sort: { '借条生成时间': -1}}, 
    );

    const jjd_count_jkr = await this.db.collection(t_jjdjj_xdq).aggregate([
      { $match: { '出借人身份证号': xyr_id }},
      { $group: { _id: "$借款人姓名" }},
      { $group: { _id: null, count: {$sum: 1} }},
    ]).next();

    const jjd_count_je = await this.db.collection(t_jjdjj_xdq).aggregate([
      { $match: { '出借人身份证号': xyr_id }},
      { $group: { 
        _id: null, 
        js: {
          $sum: {
            $cond: { if: { $eq: ["$是否还清", '是']}, then: "$借条金额", else: 0, }
          }
        }, 
        ws: {
          $sum: {
            $cond: { if: { $eq: ["$是否还清", '是']}, then: 0, else: "$借条金额", }
          }
        } 
      }},
    ]).next();

    // 统计借贷宝
    const jdb_count = await this.db.collection(t_jdbjj).aggregate([
      { $match: { '债权人证件号': xyr_id }},
      { $group: { _id: null, count: {$sum: 1} }},
    ]).next();

    // 最早时间
    const jdb_count_time_zz = await this.db.collection(t_jdbjj).findOne( 
      { '债权人证件号': xyr_id },
      { sort: { '借出时间': 1}}, 
    );

    // 最晚时间
    const jdb_count_time_zw = await this.db.collection(t_jdbjj).findOne( 
      { '债权人证件号': xyr_id },
      { sort: { '借出时间': -1}}, 
    );

    const jdb_count_jkr = await this.db.collection(t_jdbjj).aggregate([
      { $match: { '债权人证件号': xyr_id }},
      { $group: { _id: "$发标方身份证号" }},
      { $group: { _id: null, count: {$sum: 1} }},
    ]).next();
    
    const jdb_count_je = await this.db.collection(t_jdbjj).aggregate([
      { $match: { '债权人证件号': xyr_id }},
      { $group: { 
        _id: null, 
        js: {
          $sum: {
            $cond: { if: { $eq: ["$是否还清", '是']}, then: "$本金", else: 0, }
          }
        }, 
        ws: {
          $sum: {
            $cond: { if: { $eq: ["$是否还清", '是']}, then: 0, else: "$本金", }
          }
        } 
      }},
    ]).next();
    
    const t = {
      '借贷宝借款人数': jdb_count_jkr ? jdb_count_jkr.count : 0,
      '借贷宝交易笔数': jdb_count ? jdb_count.count : 0,
      '借贷宝既遂借条金额': jdb_count_je ? jdb_count_je.js : 0,
      '借贷宝未遂借条金额': jdb_count_je ? jdb_count_je.ws : 0,

      '今借到借款人数': jjd_count_jkr ? jjd_count_jkr.count : 0,
      '今借到交易笔数': jjd_count ? jjd_count.count : 0,
      '今借到既遂借条金额': jjd_count_je ? jjd_count_je.js : 0,
      '今借到未遂借条金额': jjd_count_je ? jjd_count_je.ws : 0,

      '借贷宝最早交易日期': jdb_count_time_zz ? jdb_count_time_zz['借出时间'] : '',
      '借贷宝最晚交易日期': jdb_count_time_zw ? jdb_count_time_zw['借出时间'] : '', 
      '今借到最早交易日期': jjd_count_time_zz ? jjd_count_time_zz['借条生成时间'] : '',
      '今借到最晚交易日期': jjd_count_time_zw ? jjd_count_time_zw['借条生成时间'] : '', 
    }

    md += '| ' + 
      (++number) 
      + ' | ' +
      d['所属公司'] 
      + ' | ' +
      d['姓名'] 
      + ' | ' +
      (d['入职时间'] ? date.print(d['入职时间']) : '') 
      + ' | ' +
      (d['离职时间'] ? date.print(d['离职时间']): '')
      + ' | ' +
      t['借贷宝借款人数']
      + ' | ' +
      t['借贷宝交易笔数']
      + ' | ' +
      t['借贷宝既遂借条金额']
      + ' | ' +
      t['借贷宝未遂借条金额']
      + ' |' +
      t['今借到借款人数']
      + ' | ' +
      t['今借到交易笔数']
      + ' | ' +
      t['今借到既遂借条金额']
      + ' | ' +
      t['今借到未遂借条金额']
      + ' |' +
      (t['借贷宝最早交易日期'] !== '' ? date.print(t['借贷宝最早交易日期']) : '')
      + ' | ' +
      (t['借贷宝最晚交易日期'] !== '' ? date.print(t['借贷宝最晚交易日期']) : '')
      + ' | ' +
      (t['今借到最早交易日期'] !== '' ? date.print(t['今借到最早交易日期']) : '')
      + ' | ' +
      (t['今借到最晚交易日期'] !== '' ? date.print(t['今借到最晚交易日期']) : '')
      + ' | ' +
      '\n';
  }

  const mdFile = path.join(process.cwd(), '统计汇总表_' + Date.now() + '.md');
  await fs.promises.writeFile(mdFile, md, 'utf8');
}
