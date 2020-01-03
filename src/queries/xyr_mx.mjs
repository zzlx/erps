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
  let counter = 0;

  while ((d = await cursor.next()) !== null) {
    console.progressBar(counter++, 158);

    const xyr_id = d['身份证号'];

    // 统计今借到
    const jjd_count = await this.db.collection(t_jjdjj_xdq).aggregate([
      { $match: { '出借人身份证号': xyr_id }},
      { $group: { _id: null, count: {$sum: 1} }},
    ]).next();

    const jjd_count_rzqj = await this.db.collection(t_jjdjj_xdq).aggregate([
      { $match: { 
        '出借人身份证号': xyr_id, 
        '起借时间': {
          $gte: new Date(d['入职时间'] ? d['入职时间'] : '2015-1-1'),
          $lte: new Date(d['离职时间'] ? d['离职时间'] : '2019-12-31'),
        }
      }},
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

    const jjd_count_jkr_rzqj = await this.db.collection(t_jjdjj_xdq).aggregate([
      { $match: { 
        '出借人身份证号': xyr_id,
        '起借时间': {
          $gte: new Date(d['入职时间'] ? d['入职时间'] : '2015-1-1'),
          $lte: new Date(d['离职时间'] ? d['离职时间'] : '2019-12-31'),
        }
      }},
      { $group: { _id: "$借款人姓名" }},
      { $group: { _id: null, count: {$sum: 1} }},
    ]).next();


    // 今借到金额统计
    const jjd_count_je = await this.db.collection(t_jjdjj_xdq).aggregate([
      { $match: { '出借人身份证号': xyr_id }},
      { $group: { 
        _id: null, 
        js: { $sum: { $cond: { if: { $eq: ["$是否还清", '是']}, then: "$借条金额", else: 0, } } }, 
        ws: { $sum: { $cond: { if: { $eq: ["$是否还清", '是']}, then: 0, else: "$借条金额", } } } 
      }},
    ]).next();

    // 今借到金额统计-按入职间
    const jjd_count_je_rzqj = await this.db.collection(t_jjdjj_xdq).aggregate([
      { $match: { 
        '出借人身份证号': xyr_id, 
        '起借时间': {
            $gte: new Date(d['入职时间'] ? d['入职时间'] : '2015-1-1'),
            $lte: new Date(d['离职时间'] ? d['离职时间'] : '2019-12-31'),
        }
      }},
      { $group: { 
        _id: null, 
        js: { $sum: { $cond: { if: { $eq: ["$是否还清", '是']}, then: "$借条金额", else: 0, } } }, 
        ws: { $sum: { $cond: { if: { $eq: ["$是否还清", '是']}, then: 0, else: "$借条金额", } } } 
      }},
    ]).next();

    // 统计借贷宝
    const jdb_count = await this.db.collection(t_jdbjj).aggregate([
      { $match: { '债权人证件号': xyr_id }},
      { $group: { _id: null, count: {$sum: 1} }},
    ]).next();

    const jdb_count_rzqj = await this.db.collection(t_jdbjj).aggregate([
      { $match: { 
        '债权人证件号': xyr_id,
        '借出时间': {
            $gte: new Date(d['入职时间'] ? d['入职时间'] : '2015-1-1'),
            $lte: new Date(d['离职时间'] ? d['离职时间'] : '2019-12-31'),
        }
      }},
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
    
    const jdb_count_jkr_rzqj = await this.db.collection(t_jdbjj).aggregate([
      { $match: { 
        '债权人证件号': xyr_id,
        '借出时间': {
            $gte: new Date(d['入职时间'] ? d['入职时间'] : '2015-1-1'),
            $lte: new Date(d['离职时间'] ? d['离职时间'] : '2019-12-31'),
        }
      }},
      { $group: { _id: "$发标方身份证号" }},
      { $group: { _id: null, count: {$sum: 1} }},
    ]).next();
    
    // 统计借贷宝金额
    const jdb_count_je = await this.db.collection(t_jdbjj).aggregate([
      { $match: { '债权人证件号': xyr_id }},
      { $group: { 
        _id: null, 
        js: { $sum: { $cond: { if: { $eq: ["$是否还清", '是']}, then: "$本金", else: 0, } } }, 
        ws: { $sum: { $cond: { if: { $eq: ["$是否还清", '是']}, then: 0, else: "$本金", } }
        } 
      }},
    ]).next();

    const jdb_count_je_rzqj = await this.db.collection(t_jdbjj).aggregate([
      { $match: { 
        '债权人证件号': xyr_id,
        '借出时间': {
          $gte: new Date(d['入职时间'] ? d['入职时间'] : '2015-1-1'),
          $lte: new Date(d['离职时间'] ? d['离职时间'] : '2019-12-31'),
        }
      }},
      { $group: { 
        _id: null, 
        js: { $sum: { $cond: { if: { $eq: ["$是否还清", '是']}, then: "$本金", else: 0, } } }, 
        ws: { $sum: { $cond: { if: { $eq: ["$是否还清", '是']}, then: 0, else: "$本金", } }
        } 
      }},
    ]).next();
    
    
    const t = {
      'jdb_jkrs': jdb_count_jkr ? jdb_count_jkr.count : 0,
      'jdb_jybs': jdb_count ? jdb_count.count : 0,

      'jdb_jkrs_rzqj': jdb_count_jkr_rzqj ? jdb_count_jkr.count_rzqj : 0,
      'jdb_jybs_rzqj': jdb_count_rzqj ? jdb_count.count_rzqj : 0,

      'jdb_js_jtje': jdb_count_je ? jdb_count_je.js : 0,
      'jdb_ws_jtje': jdb_count_je ? jdb_count_je.ws : 0,

      'jdb_js_jtje_rzqj': jdb_count_je_rzqj ? jdb_count_je_rzqj.js : 0,
      'jdb_ws_jtje_rzqj': jdb_count_je_rzqj ? jdb_count_je_rzqj.ws : 0,

      'jjd_jkrs': jjd_count_jkr ? jjd_count_jkr.count : 0,
      'jjd_jybs': jjd_count ? jjd_count.count : 0,

      'jjd_jkrs_rzqj': jjd_count_jkr_rzqj ? jjd_count_jkr.count_rzqj : 0,
      'jjd_jybs_rzqj': jjd_count_rzqj ? jjd_count.count_rzqj : 0,

      'jjd_js_jtje': jjd_count_je ? jjd_count_je.js : 0,
      'jjd_ws_jtje': jjd_count_je ? jjd_count_je.ws : 0,

      'jjd_js_jtje_rzqj': jjd_count_je_rzqj ? jjd_count_je_rzqj.js : 0,
      'jjd_ws_jtje_rzqj': jjd_count_je_rzqj ? jjd_count_je_rzqj.ws : 0,

      'jdb_zzjyrq': jdb_count_time_zz ? date.print(jdb_count_time_zz['借出时间']) : '暂未获取',
      'jdb_zwjyrq': jdb_count_time_zw ? date.print(jdb_count_time_zw['借出时间']) : '至今', 
      'jjd_zzjyrq': jjd_count_time_zz ? date.print(jjd_count_time_zz['借条生成时间']) : '暂未获取',
      'jjd_zwjyrq': jjd_count_time_zw ? date.print(jjd_count_time_zw['借条生成时间']) : '至今', 

      'rzsj': d['入职时间'] ? date.print(d['入职时间']) : '暂未获取',
      'lzsj': d['离职时间'] ? date.print(d['离职时间']) : '至今',
    }

    md += `
##### ${++number}.${d['姓名']}

姓名: ${d['姓名']} (证件编号: ${d['身份证号']}) 
`;

    if (d['姓名'] !== d['所属公司']) {
      md += `所属公司: ${d['所属公司']}`;
    } else {
      md += `业务分类: 个人放贷业务`;
    }

    if (t['jdb_jybs'] > 0) {
      md += `
* 借贷宝平台

| 项目 | 日期范围    | 既遂借据金额 | 未遂借据金额 | 借据总金额 | 借据笔数 | 借款人数 | 备注 |
| :--: | :------      | :------: | :----------: | :----------: | :---: | :------: | :--: |
| 全部交易 | ${t['jdb_zzjyrq']}~${t['jdb_zwjyrq']}| ${t['jdb_js_jtje']} | ${t['jdb_ws_jtje']} | ${t['jdb_js_jtje'] + t['jdb_ws_jtje']} | ${t['jdb_jybs']} | ${t['jdb_jkrs']} | . |
| 任职期间 | ${t['rzsj']}~${t['lzsj']} | ${t['jdb_js_jtje_rzqj']} | ${t['jdb_ws_jtje_rzqj']} | ${t['jdb_js_jtje_rzqj'] + t['jdb_ws_jtje_rzqj']} | ${t['jdb_jybs_rzqj']} | ${t['jdb_jkrs_rzqj']} | . |
      `; 
    }

    if (t['jjd_jybs'] > 0) {
      md += `
* 今借到平台

| 项目 | 日期范围    | 既遂借据金额 | 未遂借据金额 | 借据总金额 | 借据笔数 | 借款人数 | 备注 |
| :--: | :------      | :------: | :----------: | :----------: | :---: | :------: | :--: |
| 全部交易 | ${t['jjd_zzjyrq']}~${t['jjd_zwjyrq']}| ${t['jjd_js_jtje']} | ${t['jjd_ws_jtje']} | ${t['jjd_js_jtje'] + t['jjd_ws_jtje']} | ${t['jjd_jybs']} | ${t['jjd_jkrs']} | . |
| 任职期间 | ${t['rzsj']}~${t['lzsj']} | ${t['jjd_js_jtje_rzqj']} | ${t['jjd_ws_jtje_rzqj']} | ${t['jjd_js_jtje_rzqj'] + t['jjd_ws_jtje_rzqj']} | ${t['jjd_jybs_rzqj']} | ${t['jjd_jkrs_rzqj']} | . |
      `; 
    }

    if (!t['jdb_jybs'] && !t['jjd_jybs']) {
      md += `**无借贷平台(今借到、借贷宝)交易记录.**`;
    }

  }

  const mdFile = path.join(process.cwd(), '统计汇总表_' + Date.now() + '.md');
  await fs.promises.writeFile(mdFile, md, 'utf8');
}
