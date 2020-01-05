/**
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
  let t_xyr_ll = 'INFO.放贷利率'; 
  let t_xyr_md = 'INFO.嫌疑人_名单_20191218';
  let t_jjdjj_xdq = 't.今借到借据_新调取';
  let t_jdbjj = 'Output.借贷宝借据_1576452725938';

  const ll = await this.db.collection(t_xyr_ll).find().toArray();
  const llKeyMap = array(ll).keyMap(ll, v => v['放贷主体']);

  /*
  let jkrtj = new Set();
  let czcy = '常州存誉';
  let qdyjh = '启东袁健辉';

  const jjd_jkr = this.db.collection(t_jjdjj_xdq).find({ "业务归属": czcy, });

  let dd = null;
  while ((dd = await jjd_jkr.next()) !== null) {
    const jkr = dd['借款人身份证号'];
    jkrtj.add(jkr);
  }

  const jdb_jkr = this.db.collection(t_jdbjj).find({ "业务归属": czcy, });
  dd = null;
  while ((dd = await jdb_jkr.next()) !== null) {
    const jkr = dd['发标方身份证号'];
    jkrtj.add(jkr);
  }

  console.log(jkrtj.size);

  return;
  */

  const sum_jjd_je = await this.db.collection(t_jjdjj_xdq).aggregate([
    {$match: { 
      "业务归属": {$ne: ""}
    }},
    {$group: {
      _id: '$业务归属',
      // 既遂金额
      total_js_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }]}, then: "$借条金额", else: 0, } } },
      // 未遂金额
      total_ws_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }]}, then: "$借条金额", else: 0, } } },
    }}
  ]).toArray();

  const sum_jdb_je = await this.db.collection(t_jdbjj).aggregate([
    {$match: { 
      "业务归属": {$ne: ""}
    }},
    {$group: {
      _id: '$业务归属',
      // 既遂金额
      total_js_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }]}, then: "$本金", else: 0, } } },
      // 未遂金额
      total_ws_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }]}, then: "$本金", else: 0, } } },
    }}
  ]).toArray();

  console.log(sum_jjd_je);
  console.log(sum_jdb_je);
  return;


  const cursor = this.db.collection(t_xyr_md).find({}, {
    sort: { "所属公司": 1, "序号": 1 },
    projection: { _id: 0},
  });

  // 
  let d = null;
  let counter = 0;
  let md = ''

  while ((d = await cursor.next()) !== null) {
    console.progressBar(counter++, 158);
    const xyr_id = d['身份证号'];
    const xyr_corp = d['公司'];
    const xyr_name = d['姓名'];
    const rate_gr = llKeyMap[xyr_name] ? llKeyMap[xyr_name]['利率'] : 0;
    const rate_gs = llKeyMap[xyr_corp] ? llKeyMap[xyr_corp]['利率'] : 0;
    const isPrivate = xyr_corp === xyr_name;
    let temp = null;

    md += `
##### ${counter}.${d['姓名']}

证件号码: ${xyr_id}
`;

    md += isPrivate ?  `放贷业务分类: 个人放贷业务` : 
`所属公司: ${d['公司']}
任职期间: ${d['入职时间'] ? date.print(d['入职时间']) : ''}~${d['离职时间'] ? date.print(d['离职时间']) : '无'}
`;

    const jdb_sum = await this.db.collection(t_jdbjj).aggregate([
      { $match: { '债权人证件号': xyr_id, '业务归属': {$ne: ""} }},
      { $group: {
        _id: null,
        // 个人既遂金额
        total_gr_js_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$ne: ['$业务归属', xyr_corp]}]}, then: "$本金", else: 0, } } },
        // 个人既遂数量
        total_gr_js_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$ne: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },
        // 个人未遂金额
        total_gr_ws_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$ne: ['$业务归属', xyr_corp]}]}, then: "$本金", else: 0, } } },
        // 个人未遂数量
        total_gr_ws_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$ne: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },

        // 公司既遂金额
        total_gs_js_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: "$本金", else: 0, } } },
        // 公司既遂数量
        total_gs_js_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },
        // 公司未遂金额
        total_gs_ws_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: "$本金", else: 0, } } },
        // 公司未遂数量
        total_gs_ws_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },
      }},
    ]).next();

    const jjd_sum = await this.db.collection(t_jjdjj_xdq).aggregate([
      { $match: { '出借人身份证号': xyr_id, '业务归属': {$ne: ""} }},
      { $group: {
        _id: null,
        // 个人既遂金额
        total_gr_js_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$ne: ['$业务归属', xyr_corp]}]}, then: "$借条金额", else: 0, } } },
        // 个人既遂数量
        total_gr_js_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$ne: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },
        // 个人未遂金额
        total_gr_ws_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$ne: ['$业务归属', xyr_corp]}]}, then: "$借条金额", else: 0, } } },
        // 个人未遂数量
        total_gr_ws_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$ne: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },

        // 公司既遂金额
        total_gs_js_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: "$借条金额", else: 0, } } },
        // 公司既遂数量
        total_gs_js_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },
        // 公司未遂金额
        total_gs_ws_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: "$借条金额", else: 0, } } },
        // 公司未遂数量
        total_gs_ws_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },
      }}
    ]).next();

    md += jjd_sum || jdb_sum ? `
* 借贷平台账户记录

| 借据分类 | 既遂借据笔数 | 未遂借据笔数 | 既遂借据金额 | 未遂借据金额 | 既遂金额 | 未遂金额 | 诈骗总金额 | 适用利率 |
| :--: | :----------: | :----------: | ----------: | ----------: | ------: | ------: | --------: | :--: |` : '';

    md += jdb_sum && (jdb_sum.total_gr_js_sl || jdb_sum.total_gr_ws_sl) ?  `
| 借贷宝账户用于个人放贷 | ${jdb_sum.total_gr_js_sl} | ${jdb_sum.total_gr_ws_sl} | ${jdb_sum.total_gr_js_je} | ${jdb_sum.total_gr_ws_je} | ${Number(jdb_sum.total_gr_js_je * rate_gr).toFixed()}  | ${Number(jdb_sum.total_gr_ws_je * rate_gr).toFixed()} | ${Number((jdb_sum.total_gr_js_je + jdb_sum.total_gr_ws_je) * rate_gr).toFixed()} | ${rate_gr ? rate_gr : '--'} | ` : ''; 

    md += jdb_sum && (jdb_sum.total_gs_js_sl || jdb_sum.total_gs_ws_sl) ? `
| 借贷宝账户用于公司放贷 | ${jdb_sum.total_gs_js_sl} | ${jdb_sum.total_gs_ws_sl} | ${jdb_sum.total_gs_js_je} | ${jdb_sum.total_gs_ws_je} | ${Number(jdb_sum.total_gs_js_je * rate_gs).toFixed()}  | ${Number(jdb_sum.total_gs_ws_je * rate_gs).toFixed()} | ${Number((jdb_sum.total_gs_js_je + jdb_sum.total_gs_ws_je) * rate_gs).toFixed()} | ${rate_gs ? rate_gs : '--'} | ` : ''; 

    md += jjd_sum && (jjd_sum.total_gr_js_sl || jjd_sum.total_gr_ws_sl) ?  `
| 今借到账户用于个人放贷 | ${jjd_sum.total_gr_js_sl} | ${jjd_sum.total_gr_ws_sl} | ${jjd_sum.total_gr_js_je} | ${jjd_sum.total_gr_ws_je} | ${Number(jjd_sum.total_gr_js_je * rate_gr).toFixed()}  | ${Number(jjd_sum.total_gr_ws_je * rate_gr).toFixed()} | ${Number((jjd_sum.total_gr_js_je + jjd_sum.total_gr_ws_je) * rate_gr).toFixed()} | ${rate_gr ? rate_gr : '--'} | ` : ''; 

    md += jjd_sum && (jjd_sum.total_gs_js_sl || jjd_sum.total_gs_ws_sl) ?  `
| 今借到账户用于公司放贷 | ${jjd_sum.total_gs_js_sl} | ${jjd_sum.total_gs_ws_sl} | ${jjd_sum.total_gs_js_je} | ${jjd_sum.total_gs_ws_je} | ${Number(jjd_sum.total_gs_js_je * rate_gs).toFixed()}  | ${Number(jjd_sum.total_gs_ws_je * rate_gs).toFixed()} | ${Number((jjd_sum.total_gs_js_je + jjd_sum.total_gs_ws_je) * rate_gs).toFixed()} | ${rate_gs ? rate_gs : '--'} | ` : ''; 

    // 无个人账户情况
    md += jjd_sum || jdb_sum ? '' : `无借贷宝、今借到网贷平台账户。`;

    if (isPrivate) continue;

    // 任职期间情况统计
    const jdb_sum_rzqj = await this.db.collection(t_jdbjj).aggregate([
      { $match: { 
        '业务归属': xyr_corp,
        '借出时间': {
          $gte: new Date(d['入职时间'] || '2010-01-01'),
          $lte: new Date(d['离职时间'] || '2019-12-01'),
        }
      }},
      { $group: {
        _id: null,
        // 既遂金额
        total_js_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: "$本金", else: 0, } } },
        // 既遂数量
        total_js_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },
        // 未遂金额
        total_ws_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: "$本金", else: 0, } } },
        // 未遂数量
        total_ws_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },

      }},
    ]).next();

    // 任职期间情况统计
    const jjd_sum_rzqj = await this.db.collection(t_jjdjj_xdq).aggregate([
      { $match: { 
        '业务归属': xyr_corp,
        '起借时间': {
          $gte: new Date(d['入职时间'] ? d['入职时间'] : '2010-01-01'),
          $lte: new Date(d['离职时间'] ? d['离职时间'] : '2019-12-01'),
        }
      }},
      { $group: {
        _id: null,
        // 既遂金额
        total_js_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: "$借条金额", else: 0, } } },
        // 既遂数量
        total_js_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '是'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },
        // 未遂金额
        total_ws_je: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: "$借条金额", else: 0, } } },
        // 未遂数量
        total_ws_sl: { $sum: { $cond: { if: { $and: [{ $eq: ["$是否还清", '否'] }, {$eq: ['$业务归属', xyr_corp]}]}, then: 1, else: 0, } } },

      }},
    ]).next();

    md += jdb_sum_rzqj || jjd_sum_rzqj ? `
* 任职期间所属公司诈骗数额统计

| 借贷平台 | 既遂借据笔数 | 未遂借据笔数 | 既遂借据金额 | 未遂借据金额 | 既遂金额 | 未遂金额 | 诈骗总金额 | 适用利率 |
| :--: | :----------: | :----------: | ----------: | ----------: | ------: | ------: | --------: | :--: | ` : '';

    md += jdb_sum_rzqj ?  `
| 借贷宝 | ${jdb_sum_rzqj.total_js_sl} | ${jdb_sum_rzqj.total_ws_sl} | ${jdb_sum_rzqj.total_js_je} | ${jdb_sum_rzqj.total_ws_je} | ${Number(jdb_sum_rzqj.total_js_je * rate_gs).toFixed()}  | ${Number(jdb_sum_rzqj.total_ws_je * rate_gs).toFixed()} | ${Number((jdb_sum_rzqj.total_js_je + jdb_sum_rzqj.total_ws_je) * rate_gs).toFixed()} | ${rate_gs ? rate_gs : '--'} | ` : "";
    md += jjd_sum_rzqj ?  `
| 今借到 | ${jjd_sum_rzqj.total_js_sl} | ${jjd_sum_rzqj.total_ws_sl} | ${jjd_sum_rzqj.total_js_je} | ${jjd_sum_rzqj.total_ws_je} | ${Number(jjd_sum_rzqj.total_js_je * rate_gs).toFixed()}  | ${Number(jjd_sum_rzqj.total_ws_je * rate_gs).toFixed()} | ${Number((jjd_sum_rzqj.total_js_je + jjd_sum_rzqj.total_ws_je) * rate_gs).toFixed()} | ${rate_gs ? rate_gs : '--'} | ` : ""; 

    md += jjd_sum_rzqj && jdb_sum_rzqj ?  `
| 合计 | ${jjd_sum_rzqj.total_js_sl + jdb_sum_rzqj.total_js_sl} | ${jjd_sum_rzqj.total_ws_sl + jdb_sum_rzqj.total_ws_sl} | ${jjd_sum_rzqj.total_js_je + jdb_sum_rzqj.total_js_je} | ${jjd_sum_rzqj.total_ws_je + jdb_sum_rzqj.total_ws_je} | ${
  Number(jjd_sum_rzqj.total_js_je * rate_gs + jdb_sum_rzqj.total_js_je * rate_gs).toFixed() }  | ${ Number(jjd_sum_rzqj.total_ws_je * rate_gs + jdb_sum_rzqj.total_ws_je * rate_gs).toFixed() } | ${ Number((jjd_sum_rzqj.total_js_je + jjd_sum_rzqj.total_ws_je) * rate_gs + (jdb_sum_rzqj.total_js_je + jdb_sum_rzqj.total_ws_je) * rate_gs).toFixed() } | ${rate_gs ? rate_gs : '--'} | ` : ""; 
  }

  const mdFile = path.join(process.cwd(), '统计汇总表_' + Date.now() + '.md');
  await fs.promises.writeFile(mdFile, md, 'utf8');
}
